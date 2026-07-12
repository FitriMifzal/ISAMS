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
 * Author: [YOUR NAME HERE] Student ID: [YOUR STUDENT ID HERE] Date: July 2026
 * Purpose: ISAMS - Login microservice. Verifies teacher credentials against the
 * database and, on success, creates a real server-side HttpSession holding the
 * logged-in teacher's details. This session is what LogoutServlet later
 * invalidates.
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

        String role = request.getParameter("role");
        String tPass = request.getParameter("tPass");

        Teacher teacher = null;

        if (role == null || tPass == null || role.trim().isEmpty() || tPass.trim().isEmpty()) {
            out.print("{\"status\":\"error\", \"message\":\"Please fill in all fields\"}");
            out.flush();
            return;
        }

        if ("Penyelaras Intervensi".equals(role)) {
            String piId = request.getParameter("piId");

            if (piId == null || piId.trim().isEmpty()) {
                out.print("{\"status\":\"error\", \"message\":\"Please enter your Penyelaras ID\"}");
                out.flush();
                return;
            }

            teacher = TeacherDAO.loginPI(piId, tPass);
            
            if (teacher != null) {
                teacher.setRole("Penyelaras Intervensi");
            }

        } else if ("Teacher".equals(role)) {
            String tIC = request.getParameter("tIC");

            if (tIC == null || tIC.trim().isEmpty()) {
                out.print("{\"status\":\"error\", \"message\":\"Please enter your IC Number\"}");
                out.flush();
                return;
            }

            teacher = TeacherDAO.loginTeacher(tIC, tPass);
            
            if (teacher != null) {
                teacher.setRole("Teacher");
            }

        } else {
            out.print("{\"status\":\"error\", \"message\":\"Invalid role selected\"}");
            out.flush();
            return;
        }

        if (teacher == null) {
            out.print("{\"status\":\"error\", \"message\":\"Invalid ID, IC Number, or password\"}");
            out.flush();
            return;
        }

        HttpSession session = request.getSession(true);
        session.setAttribute("isLoggedIn", true);
        session.setAttribute("tId", teacher.getTId());
        session.setAttribute("piId", teacher.getPiId());
        session.setAttribute("tName", teacher.getTName());
        session.setAttribute("tEmail", teacher.getTEmail());
        session.setAttribute("activeRole", teacher.getRole());

        String piIdJson = teacher.getPiId() == null ? "null" : teacher.getPiId().toString();

        String json = "{"
                + "\"status\":\"success\","
                + "\"tId\":" + teacher.getTId() + ","
                + "\"piId\":" + piIdJson + ","
                + "\"tName\":\"" + escapeJson(teacher.getTName()) + "\","
                + "\"tEmail\":\"" + escapeJson(teacher.getTEmail()) + "\","
                + "\"role\":\"" + escapeJson(teacher.getRole()) + "\""
                + "}";

        out.print(json);
        out.flush();
       
    }

	private String escapeJson(String value) {
		if (value == null) {
			return "";
		}

		return value.replace("\\", "\\\\").replace("\"", "\\\"");
	}
}