package isams.controller;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import isams.dao.TeacherDAO;
import isams.model.Teacher;

/**
 * Author: [YOUR NAME HERE]
 * Student ID: [YOUR STUDENT ID HERE]
 * Date: July 2026
 * Purpose: ISAMS - Handles Teacher account creation, login, and lookups.
 *
 * GET  ?action=list           -> return all teachers
 * POST action=register        -> create a new teacher account
 * POST action=login           -> check credentials, return teacher info
 */

@WebServlet("/TeacherController")
public class TeacherController extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String action = request.getParameter("action");

        if ("list".equals(action)) {
            handleList(out);
        } else {
            out.print("{\"status\":\"error\", \"message\":\"Unknown or missing action\"}");
        }

        out.flush();
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String action = request.getParameter("action");

        if ("register".equals(action)) {
            handleRegister(request, out);
        } else if ("login".equals(action)) {
            handleLogin(request, out);
        } else if ("archive".equals(action)) {
            handleArchive(request, out);
        } else {
            out.print("{\"status\":\"error\", \"message\":\"Unknown or missing action\"}");
        }

        out.flush();
    }

    // return all teachers
    private void handleList(PrintWriter out) {
        List<Teacher> teachers = TeacherDAO.getTeachers();

        StringBuilder json = new StringBuilder();
        json.append("[");
        for (int i = 0; i < teachers.size(); i++) {
            json.append(toJson(teachers.get(i)));
            if (i < teachers.size() - 1) {
                json.append(",");
            }
        }
        json.append("]");

        out.print(json.toString());
    }

    // create a new teacher account
    private void handleRegister(HttpServletRequest request, PrintWriter out) {
        String tName = request.getParameter("tName");
        String tIC = request.getParameter("tIC");
        String tPhoneNum = request.getParameter("tPhoneNum");
        String tEmail = request.getParameter("tEmail");
        String tPass = request.getParameter("tPass");

        if (TeacherDAO.icExists(tIC)) {
            out.print("{\"status\":\"error\", \"message\":\"This IC Number is already registered\"}");
            return;
        }

        Teacher teacher = new Teacher();
        teacher.setTName(tName);
        teacher.setTIC(tIC);
        teacher.setTPhoneNum(tPhoneNum);
        teacher.setTEmail(tEmail);
        teacher.setTPass(tPass);

        TeacherDAO.addTeacher(teacher);

        out.print("{\"status\":\"success\", \"message\":\"Account created successfully\"}");
    }

    // check login credentials
    private void handleLogin(HttpServletRequest request, PrintWriter out) {
        String ic = request.getParameter("tIC");
        String pass = request.getParameter("tPass");

        Teacher teacher = TeacherDAO.login(ic, pass);

        if (teacher == null) {
            out.print("{\"status\":\"error\", \"message\":\"Invalid email or password\"}");
        } else {
            StringBuilder json = new StringBuilder();
            json.append("{");
            json.append("\"status\":\"success\",");
            json.append("\"tId\":").append(teacher.getTId()).append(",");
            json.append("\"tName\":\"").append(escapeJson(teacher.getTName())).append("\",");
            json.append("\"tEmail\":\"").append(escapeJson(teacher.getTEmail())).append("\"");
            json.append("}");
            out.print(json.toString());
        }
    }

    // archive a teacher account
    private void handleArchive(HttpServletRequest request, PrintWriter out) {
        try {
            int tId = Integer.parseInt(request.getParameter("tId"));
            TeacherDAO.archiveTeacher(tId);
            out.print("{\"status\":\"success\", \"message\":\"Account archived successfully\"}");
        } catch (NumberFormatException e) {
            out.print("{\"status\":\"error\", \"message\":\"Invalid teacher id\"}");
        }
    }

    // convert a Teacher object to a JSON string
    private String toJson(Teacher t) {
        StringBuilder json = new StringBuilder();
        json.append("{");
        json.append("\"tId\":").append(t.getTId()).append(",");
        json.append("\"tName\":\"").append(escapeJson(t.getTName())).append("\",");
        json.append("\"tIC\":\"").append(escapeJson(t.getTIC())).append("\",");
        json.append("\"tPhoneNum\":\"").append(escapeJson(t.getTPhoneNum())).append("\",");
        json.append("\"tEmail\":\"").append(escapeJson(t.getTEmail())).append("\",");
        json.append("\"status\":\"").append(escapeJson(t.getStatus())).append("\"");
        json.append("}");
        return json.toString();
    }

    private String escapeJson(String value) {
        if (value == null) return "";
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}