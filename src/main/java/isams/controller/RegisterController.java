package isams.controller;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import isams.dao.RegisterDAO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/RegisterController")
public class RegisterController extends HttpServlet {
    private static final long serialVersionUID = 1L;

    // ============================================================
    // NEW: GET ?action=list  -> JSON array of saved enrollments
    // Without this, the front-end GET hit 405 Method Not Allowed,
    // which is why the summary card showed "Failed to load summary data."
    // ============================================================
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String action = request.getParameter("action");

        if (!"list".equals(action)) {
            out.print("[]");
            return;
        }

        try {
            List<String[]> rows = RegisterDAO.getAllEnrollments();

            StringBuilder json = new StringBuilder();
            json.append("[");
            for (int i = 0; i < rows.size(); i++) {
                String[] r = rows.get(i);
                if (i > 0) json.append(",");
                json.append("{")
                    .append("\"stuId\":").append(r[0]).append(",")
                    .append("\"stuName\":\"").append(escape(r[1])).append("\",")
                    .append("\"subId\":").append(r[2]).append(",")
                    .append("\"subName\":\"").append(escape(r[3])).append("\",")
                    .append("\"classId\":").append(r[4]).append(",")
                    .append("\"className\":\"").append(escape(r[5])).append("\"")
                    .append("}");
            }
            json.append("]");

            out.print(json.toString());
        } catch (Exception e) {
            e.printStackTrace();
            out.print("[]");
        }
    }

    // escape characters that would break the JSON string
    private String escape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("text/plain");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        try {
            int subId = Integer.parseInt(request.getParameter("subId"));
            int stuId = Integer.parseInt(request.getParameter("stuId"));
            RegisterDAO.enrollStudent(subId, stuId);
            out.print("success");
        } catch (Exception e) {
            e.printStackTrace();
            out.print("error");
        }
    }
}