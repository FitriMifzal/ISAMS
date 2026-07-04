package isams.controller;

import java.io.IOException;
import java.io.PrintWriter;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import isams.dao.TeacherDAO;
import isams.model.Teacher;

/**
 * Author: [YOUR NAME HERE]
 * Student ID: [YOUR STUDENT ID HERE]
 * Date: July 2026
 * Purpose: ISAMS - Login microservice.
 * Verifies teacher credentials against the database and, on success,
 * creates a real server-side HttpSession holding the logged-in teacher's
 * details. This session is what LogoutServlet later invalidates.
 *
 * POST tIC, tPass -> returns JSON with login result
 */

@WebServlet("/LoginServlet")
public class LoginServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String ic = request.getParameter("tIC");
        String pass = request.getParameter("tPass");

        // 1. verify credentials against the database
        Teacher teacher = TeacherDAO.login(ic, pass);

        if (teacher == null) {
            out.print("{\"status\":\"error\", \"message\":\"Invalid IC Number or password\"}");
            out.flush();
            return;
        }

        // 2. create a real server-side session for this teacher
        HttpSession session = request.getSession(true); // true = create if not exists
        session.setAttribute("isLoggedIn", true);
        session.setAttribute("tId", teacher.getTId());
        session.setAttribute("tName", teacher.getTName());
        session.setAttribute("activeRole", "Subject Teacher");

        // optional: session expires after 30 minutes of inactivity
        session.setMaxInactiveInterval(30 * 60);

        // 3. return success + teacher info so the frontend can also update localStorage
        StringBuilder json = new StringBuilder();
        json.append("{");
        json.append("\"status\":\"success\",");
        json.append("\"tId\":").append(teacher.getTId()).append(",");
        json.append("\"tName\":\"").append(escapeJson(teacher.getTName())).append("\"");
        json.append("}");

        out.print(json.toString());
        out.flush();
    }

    private String escapeJson(String value) {
        if (value == null) return "";
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
