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
            handleList(request, out);
        } else if ("get".equals(action)) {
            handleGet(request, out);
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
        } else if ("updateProfile".equals(action)) {
            handleUpdateProfile(request, out);
        } else if ("archive".equals(action)) {
            handleArchive(request, out);
        } else {
            out.print("{\"status\":\"error\", \"message\":\"Unknown or missing action\"}");
        }

        out.flush();
    }

    // return only the teachers belonging to the given PI
    private void handleList(HttpServletRequest request, PrintWriter out) {
        String piIdParam = request.getParameter("piId");

        if (piIdParam == null || piIdParam.isEmpty()) {
            out.print("{\"status\":\"error\", \"message\":\"Missing piId parameter\"}");
            return;
        }

        int piId;
        try {
            piId = Integer.parseInt(piIdParam);
        } catch (NumberFormatException e) {
            out.print("{\"status\":\"error\", \"message\":\"Invalid piId parameter\"}");
            return;
        }

        List<Teacher> teachers = TeacherDAO.getTeachersByPi(piId);

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

    // return one teacher by id
    private void handleGet(HttpServletRequest request, PrintWriter out) {
        String idParam = request.getParameter("id");

        if (idParam == null || idParam.isEmpty()) {
            out.print("{\"status\":\"error\", \"message\":\"Missing id parameter\"}");
            return;
        }

        try {
            int tId = Integer.parseInt(idParam);
            Teacher teacher = TeacherDAO.getTeacher(tId);

            if (teacher == null) {
                out.print("{\"status\":\"error\", \"message\":\"Teacher not found\"}");
            } else {
                out.print(toJson(teacher));
            }
        } catch (NumberFormatException e) {
            out.print("{\"status\":\"error\", \"message\":\"Invalid id parameter\"}");
        }
    }

    // create a new teacher account
    // must be called by a logged-in PI - the PI's own T_ID is sent as "piId"
    // and stored as the new teacher's PI_ID (who created them)
    private void handleRegister(HttpServletRequest request, PrintWriter out) {
        String tName = request.getParameter("tName");
        String tIC = request.getParameter("tIC");
        String tPhoneNum = request.getParameter("tPhoneNum");
        String tEmail = request.getParameter("tEmail");
        String tPass = request.getParameter("tPass");
        String piIdParam = request.getParameter("piId");

        if (TeacherDAO.icExists(tIC)) {
            out.print("{\"status\":\"error\", \"message\":\"This IC Number is already registered\"}");
            return;
        }

        int creatorPiId;
        try {
            creatorPiId = Integer.parseInt(piIdParam);
        } catch (NumberFormatException e) {
            out.print("{\"status\":\"error\", \"message\":\"Missing or invalid PI id\"}");
            return;
        }

        Teacher teacher = new Teacher();
        teacher.setTName(tName);
        teacher.setTIC(tIC);
        teacher.setTPhoneNum(tPhoneNum);
        teacher.setTEmail(tEmail);
        teacher.setTPass(tPass);

        TeacherDAO.addTeacher(teacher, creatorPiId);

        out.print("{\"status\":\"success\", \"message\":\"Account created successfully\"}");
    }

    // update a teacher's own profile (name, phone, email)
    private void handleUpdateProfile(HttpServletRequest request, PrintWriter out) {
        try {
            Teacher teacher = new Teacher();
            teacher.setTId(Integer.parseInt(request.getParameter("tId")));
            teacher.setTName(request.getParameter("tName"));
            teacher.setTPhoneNum(request.getParameter("tPhoneNum"));
            teacher.setTEmail(request.getParameter("tEmail"));

            TeacherDAO.updateTeacher(teacher);

            out.print("{\"status\":\"success\", \"message\":\"Profile updated successfully\"}");
        } catch (NumberFormatException e) {
            out.print("{\"status\":\"error\", \"message\":\"Invalid teacher id\"}");
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