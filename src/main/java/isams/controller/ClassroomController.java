package isams.controller;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import isams.dao.ClassroomDAO;
import isams.model.Classroom;


@WebServlet("/ClassroomController")
public class ClassroomController extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String action = request.getParameter("action");

        if ("list".equals(action)) {
            handleList(out);
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

        if ("create".equals(action)) {
            handleCreate(request, out);
        } else if ("update".equals(action)) {
            handleUpdate(request, out);
        } else {
            out.print("{\"status\":\"error\", \"message\":\"Unknown or missing action\"}");
        }

        out.flush();
    }

    // return all classrooms
    private void handleList(PrintWriter out) {
        List<Classroom> classes = ClassroomDAO.getClasses();

        StringBuilder json = new StringBuilder();
        json.append("[");
        for (int i = 0; i < classes.size(); i++) {
            json.append(toJson(classes.get(i)));
            if (i < classes.size() - 1) {
                json.append(",");
            }
        }
        json.append("]");

        out.print(json.toString());
    }

    // return one classroom by id
    private void handleGet(HttpServletRequest request, PrintWriter out) {
        String idParam = request.getParameter("id");

        if (idParam == null || idParam.isEmpty()) {
            out.print("{\"status\":\"error\", \"message\":\"Missing id parameter\"}");
            return;
        }

        try {
            int classId = Integer.parseInt(idParam);
            Classroom c = ClassroomDAO.getClassRoom(classId);

            if (c == null) {
                out.print("{\"status\":\"error\", \"message\":\"Class not found\"}");
            } else {
                out.print(toJson(c));
            }
        } catch (NumberFormatException e) {
            out.print("{\"status\":\"error\", \"message\":\"Invalid id parameter\"}");
        }
    }

    // insert a new classroom
    private void handleCreate(HttpServletRequest request, PrintWriter out) {
        String classCode = request.getParameter("classCode");
        String className = request.getParameter("className");

        Classroom classRoom = new Classroom();
        classRoom.setClassCode(classCode);
        classRoom.setClassName(className);

        ClassroomDAO.addClassRoom(classRoom);

        out.print("{\"status\":\"success\", \"message\":\"Class created successfully\"}");
    }

    // update an existing classroom
    private void handleUpdate(HttpServletRequest request, PrintWriter out) {
        try {
            int classId = Integer.parseInt(request.getParameter("classId"));
            String classCode = request.getParameter("classCode");
            String className = request.getParameter("className");

            Classroom classRoom = new Classroom();
            classRoom.setClassId(classId);
            classRoom.setClassCode(classCode);
            classRoom.setClassName(className);

            ClassroomDAO.updateClassRoom(classRoom);

            out.print("{\"status\":\"success\", \"message\":\"Class updated successfully\"}");
        } catch (NumberFormatException e) {
            out.print("{\"status\":\"error\", \"message\":\"Invalid class id\"}");
        }
    }

    // convert a Classroom object to a JSON string
    private String toJson(Classroom c) {
        StringBuilder json = new StringBuilder();
        json.append("{");
        json.append("\"classId\":").append(c.getClassId()).append(",");
        json.append("\"classCode\":\"").append(escapeJson(c.getClassCode())).append("\",");
        json.append("\"className\":\"").append(escapeJson(c.getClassName())).append("\"");
        json.append("}");
        return json.toString();
    }

    // prevent broken JSON if text contains quotes
    private String escapeJson(String value) {
        if (value == null) return "";
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}