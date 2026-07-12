package isams.controller;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import isams.connection.ConnectionManager;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

/**
 * ISAMS - Login microservice.
 *
 * Perubahan berbanding versi lama (HANYA fail ini yang diubah):
 *
 * 1. loginPI() lama query "WHERE pi_id = ?". Dalam DB, PI_ID kebanyakannya NULL,
 *    jadi Penyelaras ID seperti 24 tidak pernah dijumpai walaupun T_ID 24 wujud.
 *    Di sini Penyelaras ID di-resolve DUA peringkat:
 *       (a) padan dengan T_ID   -> kes biasa (kau taip 24 = T_ID 24)
 *       (b) kalau tiada, padan dengan PI_ID -> sokong data lama
 *    Kalau (b) memulangkan lebih daripada satu baris, ia ditolak sebagai ambiguous
 *    supaya sistem TIDAK log masuk orang yang salah secara senyap.
 *
 * 2. Semua perbandingan guna TRIM(). Oracle membandingkan column CHAR dengan bind
 *    variable menggunakan non-padded semantics, jadi 'abc   ' != 'abc' dan login
 *    gagal walaupun data betul. TRIM() membunuh masalah itu.
 *
 * 3. Connection/PreparedStatement/ResultSet bersifat local + try-with-resources,
 *    bukan static field yang dikongsi antara request.
 *
 * 4. Response dihantar dengan header no-store supaya tiada cache JSON login lama.
 *
 * 5. 'role' yang dipulangkan DIKUNCI kepada pilihan radio button pengguna, dan
 *    turut dihantar sebagai flag boolean isPenyelaras untuk kegunaan UI.
 *
 * 6. TAMBAHAN: role yang dipilih pengguna kini disahkan terhadap pi_id akaun
 *    sebenar sebelum session dicipta. Sebelum ini, sesiapa yang tahu IC/T_ID
 *    dan password TEACHER biasa boleh pilih "Penyelaras Intervensi" pada radio
 *    button dan log masuk sebagai PI walaupun pi_id mereka bukan NULL. Sekarang
 *    role PI hanya diberi jika account.piId benar-benar NULL, dan role Teacher
 *    hanya diberi jika account.piId bukan NULL.
 *
 * POST role, tPass, (piId | tIC) -> JSON
 */
@WebServlet("/LoginServlet")
public class LoginServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    private static final String ROLE_PI = "Penyelaras Intervensi";
    private static final String ROLE_TEACHER = "Teacher";

    /** Baris akaun yang dibaca terus dari DB - elak bergantung pada signature model Teacher. */
    private static class Account {
        int tId;
        Integer piId;       // benar-benar null kalau column NULL
        String tName;
        String tIC;
        String tEmail;
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setDateHeader("Expires", 0);

        PrintWriter out = response.getWriter();

        // Buang session lama SEBELUM sebarang percubaan login baharu.
        HttpSession oldSession = request.getSession(false);
        if (oldSession != null) {
            oldSession.invalidate();
        }

        String role = trimOrNull(request.getParameter("role"));
        String tPass = trimOrNull(request.getParameter("tPass"));

        if (role == null || tPass == null) {
            writeError(out, "Please fill in all fields");
            return;
        }

        Account account;

        if (ROLE_PI.equals(role)) {

            String piIdRaw = trimOrNull(request.getParameter("piId"));
            if (piIdRaw == null) {
                writeError(out, "Please enter your Penyelaras ID");
                return;
            }

            int piIdValue;
            try {
                piIdValue = Integer.parseInt(piIdRaw);
            } catch (NumberFormatException e) {
                writeError(out, "Penyelaras ID must be number only");
                return;
            }

            // (a) Penyelaras ID = T_ID
            account = findByTId(piIdValue, tPass);

            // (b) Fallback: Penyelaras ID = PI_ID
            if (account == null) {
                int matches = countByPiId(piIdValue, tPass);
                if (matches > 1) {
                    writeError(out, "Penyelaras ID " + piIdValue
                            + " is linked to more than one account. Please contact the administrator.");
                    return;
                }
                if (matches == 1) {
                    account = findByPiId(piIdValue, tPass);
                }
            }

        } else if (ROLE_TEACHER.equals(role)) {

            String tIC = trimOrNull(request.getParameter("tIC"));
            if (tIC == null) {
                writeError(out, "Please enter your IC Number");
                return;
            }

            account = findByIC(tIC, tPass);

        } else {
            writeError(out, "Invalid role selected");
            return;
        }

        if (account == null) {
            writeError(out, "Invalid ID, IC Number, or password");
            return;
        }

        // Sahkan role yang dipilih pengguna PADAN dengan status sebenar akaun.
        // PI sebenar = pi_id IS NULL (tidak lapor kepada sesiapa).
        // Teacher biasa = pi_id IS NOT NULL (lapor kepada seorang PI).
        boolean claimsToBePI = ROLE_PI.equals(role);
        boolean accountIsPI = (account.piId == null);

        if (claimsToBePI != accountIsPI) {
            writeError(out, "This account is not registered as " + role + ".");
            return;
        }

        // Session baharu, bersih, untuk akaun yang baru sahaja disahkan.
        HttpSession session = request.getSession(true);
        session.setAttribute("isLoggedIn", Boolean.TRUE);
        session.setAttribute("tId", account.tId);
        session.setAttribute("piId", account.piId);
        session.setAttribute("tName", account.tName);
        session.setAttribute("tIC", account.tIC);
        session.setAttribute("tEmail", account.tEmail);
        session.setAttribute("role", role);
        session.setAttribute("activeRole", role);
        session.setAttribute("isPenyelaras", ROLE_PI.equals(role));

        StringBuilder json = new StringBuilder();
        json.append("{")
            .append("\"status\":\"success\",")
            .append("\"tId\":").append(account.tId).append(",")
            .append("\"piId\":").append(account.piId == null ? "null" : account.piId).append(",")
            .append("\"tName\":\"").append(escapeJson(account.tName)).append("\",")
            .append("\"tEmail\":\"").append(escapeJson(account.tEmail)).append("\",")
            .append("\"isPenyelaras\":").append(ROLE_PI.equals(role)).append(",")
            .append("\"role\":\"").append(escapeJson(role)).append("\"")
            .append("}");

        out.print(json.toString());
        out.flush();
    }

    /* ────────────────────────── DB LOOKUPS ────────────────────────── */

    private static final String BASE_COLUMNS =
            "SELECT t_id, pi_id, t_name, t_ic, t_email FROM teacher WHERE ";

    private static final String ACTIVE_AND_PASS =
            " AND TRIM(t_pass) = ? AND TRIM(UPPER(status)) = 'ACTIVE'";

    private Account findByTId(int tId, String pass) {
        String sql = BASE_COLUMNS + "t_id = ?" + ACTIVE_AND_PASS;
        try (Connection con = ConnectionManager.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, tId);
            ps.setString(2, pass);

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? map(rs) : null;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private Account findByPiId(int piId, String pass) {
        String sql = BASE_COLUMNS + "pi_id = ?" + ACTIVE_AND_PASS;
        try (Connection con = ConnectionManager.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, piId);
            ps.setString(2, pass);

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? map(rs) : null;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /** Elak login orang yang salah bila satu PI_ID dikongsi beberapa baris. */
    private int countByPiId(int piId, String pass) {
        String sql = "SELECT COUNT(*) FROM teacher WHERE pi_id = ?" + ACTIVE_AND_PASS;
        try (Connection con = ConnectionManager.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, piId);
            ps.setString(2, pass);

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? rs.getInt(1) : 0;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    private Account findByIC(String ic, String pass) {
        String sql = BASE_COLUMNS + "TRIM(t_ic) = ?" + ACTIVE_AND_PASS;
        try (Connection con = ConnectionManager.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, ic);
            ps.setString(2, pass);

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? map(rs) : null;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private Account map(ResultSet rs) throws Exception {
        Account a = new Account();
        a.tId = rs.getInt("t_id");

        int pi = rs.getInt("pi_id");
        a.piId = rs.wasNull() ? null : Integer.valueOf(pi);   // NULL kekal NULL, bukan 0

        a.tName = safe(rs.getString("t_name"));
        a.tIC = safe(rs.getString("t_ic"));
        a.tEmail = safe(rs.getString("t_email"));
        return a;
    }

    /* ────────────────────────── HELPERS ────────────────────────── */

    private void writeError(PrintWriter out, String message) {
        out.print("{\"status\":\"error\",\"message\":\"" + escapeJson(message) + "\"}");
        out.flush();
    }

    private static String trimOrNull(String value) {
        if (value == null) {
            return null;
        }
        String t = value.trim();
        return t.isEmpty() ? null : t;
    }

    private static String safe(String value) {
        return value == null ? "" : value.trim();
    }

    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "\\\\")
                    .replace("\"", "\\\"")
                    .replace("\n", "\\n")
                    .replace("\r", "\\r")
                    .replace("\t", "\\t");
    }
}