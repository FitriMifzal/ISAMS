package isams.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

import isams.connection.ConnectionManager;

public class RegisterDAO {

    // register a student into a subject, skipping if already registered
    // (single atomic query - avoids a race between checking and inserting)
    public static void enrollStudent(int subId, int stuId) {
        try {
            Connection con = ConnectionManager.getConnection();
            String sql =
                "INSERT INTO register (sub_id, stu_id) " +
                "SELECT ?, ? FROM dual " +
                "WHERE NOT EXISTS ( " +
                "SELECT 1 FROM register " +
                "WHERE sub_id = ? AND stu_id = ? " +
                ")";
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, subId);
            ps.setInt(2, stuId);
            ps.setInt(3, subId);
            ps.setInt(4, stuId);
            ps.executeUpdate();
            con.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // ============================================================
    // NEW: fetch every saved enrollment (student x subject)
    // Joins REGISTER -> STUDENT -> SUBJECT -> CLASSROOM directly.
    // CLASS_SESSION is intentionally NOT joined: joining it on
    // SUB_ID alone multiplies rows (fan-out) and produces duplicates.
    // Returns rows of: {stuId, stuName, subId, subName, classId, className}
    // ============================================================
    public static List<String[]> getAllEnrollments() {
        List<String[]> list = new ArrayList<String[]>();
        try {
            Connection con = ConnectionManager.getConnection();
            String sql =
                "SELECT s.stu_id, s.stu_name, sub.sub_id, sub.sub_name, " +
                "       cr.class_id, cr.class_name " +
                "FROM register r " +
                "JOIN student s   ON r.stu_id = s.stu_id " +
                "JOIN subject sub ON r.sub_id = sub.sub_id " +
                "JOIN classroom cr ON s.class_id = cr.class_id " +
                "ORDER BY sub.sub_name, s.stu_name";
            PreparedStatement ps = con.prepareStatement(sql);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                String[] row = new String[6];
                row[0] = String.valueOf(rs.getInt("stu_id"));
                row[1] = rs.getString("stu_name") == null ? "" : rs.getString("stu_name").trim();
                row[2] = String.valueOf(rs.getInt("sub_id"));
                row[3] = rs.getString("sub_name") == null ? "" : rs.getString("sub_name").trim();
                row[4] = String.valueOf(rs.getInt("class_id"));
                row[5] = rs.getString("class_name") == null ? "" : rs.getString("class_name").trim();
                list.add(row);
            }
            rs.close();
            ps.close();
            con.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }
}