package isams.controller;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import isams.dao.SubjectDAO;
import isams.model.Subject;

@WebServlet("/SubjectController")
public class SubjectController extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String action = request.getParameter("action");

        if ("list".equals(action)) {
            handleList(out);
        } else if ("assignments".equals(action)) {
            handleAssignments(out);
        } else if ("get".equals(action)) {
            handleGet(request, out);
        } else if ("checkDuplicate".equals(action)) {
            // ============================================================
            // BARU TAMBAH: Check duplicate subject
            // ============================================================
            handleCheckDuplicate(request, out);
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
        } else if ("enroll".equals(action)) {
            handleEnroll(request, out);
        } else {
            out.print("{\"status\":\"error\", \"message\":\"Unknown or missing action\"}");
        }

        out.flush();
    }
    
    // return all subjects
    private void handleList(PrintWriter out) {
        List<Subject> subjects = SubjectDAO.getSubjects();

        StringBuilder json = new StringBuilder();
        json.append("[");
        for (int i = 0; i < subjects.size(); i++) {
            json.append(toJson(subjects.get(i)));
            if (i < subjects.size() - 1) {
                json.append(",");
            }
        }
        json.append("]");

        out.print(json.toString());
    }

    // return one subject by id
    private void handleGet(HttpServletRequest request, PrintWriter out) {
        String idParam = request.getParameter("id");

        if (idParam == null || idParam.isEmpty()) {
            out.print("{\"status\":\"error\", \"message\":\"Missing id parameter\"}");
            return;
        }

        try {
            int subId = Integer.parseInt(idParam);
            Subject subject = SubjectDAO.getSubject(subId);

            if (subject == null) {
                out.print("{\"status\":\"error\", \"message\":\"Subject not found\"}");
            } else {
                out.print(toJson(subject));
            }
        } catch (NumberFormatException e) {
            out.print("{\"status\":\"error\", \"message\":\"Invalid id parameter\"}");
        }
    }

    // ============================================================
    // BARU TAMBAH: Check duplicate subject
    // ============================================================
    private void handleCheckDuplicate(HttpServletRequest request, PrintWriter out) {
        String subName = request.getParameter("subName");
        String excludeSubIdParam = request.getParameter("excludeSubId");

        if (subName == null || subName.trim().isEmpty()) {
            out.print("{\"status\":\"error\", \"message\":\"Subject name is required\"}");
            return;
        }

        try {
            Integer excludeSubId = null;
            if (excludeSubIdParam != null && !excludeSubIdParam.trim().isEmpty()) {
                excludeSubId = Integer.parseInt(excludeSubIdParam);
            }

            boolean exists = SubjectDAO.isSubjectExists(subName.trim(), excludeSubId);
            
            // Response: { "status": "success", "isDuplicate": true/false }
            out.print("{\"status\":\"success\", \"isDuplicate\":" + exists + "}");
            
        } catch (NumberFormatException e) {
            out.print("{\"status\":\"error\", \"message\":\"Invalid excludeSubId parameter\"}");
        }
    }

    // insert a new subject
    private void handleCreate(HttpServletRequest request, PrintWriter out) {
        try {
            Subject subject = new Subject();
            subject.setSubName(request.getParameter("subName"));
            subject.setCreditHours(Integer.parseInt(request.getParameter("creditHours")));

            SubjectDAO.addSubject(subject);

            out.print("{\"status\":\"success\", \"message\":\"Subject created successfully\"}");
        } catch (NumberFormatException e) {
            out.print("{\"status\":\"error\", \"message\":\"Invalid credit hours\"}");
        }
    }

    // update an existing subject
    private void handleUpdate(HttpServletRequest request, PrintWriter out) {
        try {
            Subject subject = new Subject();
            subject.setSubId(Integer.parseInt(request.getParameter("subId")));
            subject.setSubName(request.getParameter("subName"));
            subject.setCreditHours(Integer.parseInt(request.getParameter("creditHours")));

            SubjectDAO.updateSubject(subject);

            out.print("{\"status\":\"success\", \"message\":\"Subject updated successfully\"}");
        } catch (NumberFormatException e) {
            out.print("{\"status\":\"error\", \"message\":\"Invalid id or credit hours\"}");
        }
    }

    // return all teaching assignments (subject + class + teacher)
    private void handleAssignments(PrintWriter out) {
        java.util.List<String> rows = SubjectDAO.getAssignmentsJson();
        StringBuilder json = new StringBuilder();
        json.append("[");
        for (int i = 0; i < rows.size(); i++) {
            json.append(rows.get(i));
            if (i < rows.size() - 1) json.append(",");
        }
        json.append("]");
        out.print(json.toString());
    }

    // a teacher enrolls to teach a subject for a specific class
    private void handleEnroll(HttpServletRequest request, PrintWriter out) {
        try {
            int subId = Integer.parseInt(request.getParameter("subId"));
            int tId = Integer.parseInt(request.getParameter("tId"));
            int classId = Integer.parseInt(request.getParameter("classId"));

            boolean ok = SubjectDAO.enrollTeacher(subId, classId, tId);
            if (ok) {
                out.print("{\"status\":\"success\", \"message\":\"Enrolled successfully\"}");
            } else {
                out.print("{\"status\":\"error\", \"message\":\"You are already enrolled for this subject and class\"}");
            }
        } catch (NumberFormatException e) {
            out.print("{\"status\":\"error\", \"message\":\"Invalid id\"}");
        }
    }

    // convert a Subject object to a JSON string - name/credit hours only,
    // teacher info is no longer part of Subject (see action=assignments)
    private String toJson(Subject s) {
        StringBuilder json = new StringBuilder();
        json.append("{");
        json.append("\"subId\":").append(s.getSubId()).append(",");
        json.append("\"subName\":\"").append(escapeJson(s.getSubName())).append("\",");
        json.append("\"creditHours\":").append(s.getCreditHours());
        json.append("}");
        return json.toString();
    }

    private String escapeJson(String value) {
        if (value == null) return "";
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}