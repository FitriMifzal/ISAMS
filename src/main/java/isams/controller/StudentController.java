package isams.controller;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import isams.dao.StudentDAO;
import isams.model.Student;
import isams.dao.SVMDAO;
import isams.dao.DVMDAO;
import isams.model.SVM;
import isams.model.DVM;

/**
 * Author: [YOUR NAME HERE]
 * Student ID: [YOUR STUDENT ID HERE]
 * Date: July 2026
 * Purpose: ISAMS - Handles all Student CRUD requests from frontend.
 *
 * GET  ?action=list          -> return all students
 * GET  ?action=get&id=5      -> return one student
 * POST action=create         -> insert a new student
 * POST action=update         -> update an existing student
 */

@WebServlet("/StudentController")
public class StudentController extends HttpServlet {
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
        }  else if ("update".equals(action)) {
            handleUpdate(request, out);
        } else if ("delete".equals(action)) {
            handleDelete(request, out);
        } else {
            out.print("{\"status\":\"error\", \"message\":\"Unknown or missing action\"}");
        }

        out.flush();
    }

    // return all students
    private void handleList(PrintWriter out) {
        List<Student> students = StudentDAO.getStudents();

        StringBuilder json = new StringBuilder();
        json.append("[");
        for (int i = 0; i < students.size(); i++) {
            json.append(toJson(students.get(i)));
            if (i < students.size() - 1) {
                json.append(",");
            }
        }
        json.append("]");

        out.print(json.toString());
    }

    // return one student by id
    private void handleGet(HttpServletRequest request, PrintWriter out) {
        String idParam = request.getParameter("id");

        if (idParam == null || idParam.isEmpty()) {
            out.print("{\"status\":\"error\", \"message\":\"Missing id parameter\"}");
            return;
        }

        try {
            int stuId = Integer.parseInt(idParam);
            Student s = StudentDAO.getStudent(stuId);

            if (s == null) {
                out.print("{\"status\":\"error\", \"message\":\"Student not found\"}");
            } else {
                out.print(toJson(s));
            }
        } catch (NumberFormatException e) {
            out.print("{\"status\":\"error\", \"message\":\"Invalid id parameter\"}");
        }
    }

    // insert a new student
    private void handleCreate(HttpServletRequest request, PrintWriter out) {
        try {
            Student student = new Student();
            student.setStuName(request.getParameter("stuName"));
            student.setStuIC(request.getParameter("stuIC"));
            student.setStuAdd(request.getParameter("stuAdd"));
            student.setStuPhoneNum(request.getParameter("stuPhoneNum"));
            student.setClassId(Integer.parseInt(request.getParameter("classId")));
            student.setStudentType(request.getParameter("studentType"));

            StudentDAO.addStudent(student);

            out.print("{\"status\":\"success\", \"message\":\"Student created successfully\"}");
        } catch (NumberFormatException e) {
            out.print("{\"status\":\"error\", \"message\":\"Invalid class id\"}");
        }
    }

    // update an existing student
    private void handleUpdate(HttpServletRequest request, PrintWriter out) {
        try {
            Student student = new Student();

            student.setStuId(Integer.parseInt(request.getParameter("stuId")));
            student.setStuName(request.getParameter("stuName"));
            student.setStuIC(request.getParameter("stuIC"));
            student.setStuAdd(request.getParameter("stuAdd"));
            student.setStuPhoneNum(request.getParameter("stuPhoneNum"));
            student.setClassId(Integer.parseInt(request.getParameter("classId")));
            student.setStudentType(request.getParameter("studentType"));

            StudentDAO.updateStudent(student);

            if ("SVM".equalsIgnoreCase(student.getStudentType())) {
                SVM svm = new SVM();
                svm.setStuId(student.getStuId());
                svm.setCgpaA(Double.parseDouble(request.getParameter("cgpaA")));
                svm.setCgpaV(Double.parseDouble(request.getParameter("cgpaV")));

                SVMDAO.upsertSVM(svm);
            }

            if ("DVM".equalsIgnoreCase(student.getStudentType())) {
                DVM dvm = new DVM();
                dvm.setStuId(student.getStuId());
                dvm.setRepeatPaper(Integer.parseInt(request.getParameter("repeatPaper")));

                DVMDAO.upsertDVM(dvm);
            }

            out.print("success");

        } catch (Exception e) {
            e.printStackTrace();
            out.print("error");
        }
    }
    private void handleDelete(HttpServletRequest request, PrintWriter out) {
        try {
            int stuId = Integer.parseInt(request.getParameter("id"));

            StudentDAO.deleteStudent(stuId);

            out.print("success");

        } catch (Exception e) {
            e.printStackTrace();
            out.print("error");
        }
    }
    private String toJson(Student s) {
        StringBuilder json = new StringBuilder();
        json.append("{");
        json.append("\"stuId\":").append(s.getStuId()).append(",");
        json.append("\"stuName\":\"").append(escapeJson(s.getStuName())).append("\",");
        json.append("\"stuIC\":\"").append(escapeJson(s.getStuIC())).append("\",");
        json.append("\"stuAdd\":\"").append(escapeJson(s.getStuAdd())).append("\",");
        json.append("\"stuPhoneNum\":\"").append(escapeJson(s.getStuPhoneNum())).append("\",");
        json.append("\"classId\":").append(s.getClassId()).append(",");
        json.append("\"studentType\":\"").append(escapeJson(s.getStudentType())).append("\",");
        json.append("\"classCode\":\"").append(escapeJson(s.getClassCode())).append("\",");
        json.append("\"className\":\"").append(escapeJson(s.getClassName())).append("\"");
        json.append("}");
        return json.toString();
    }

    // prevent broken JSON if text contains quotes
    private String escapeJson(String value) {
        if (value == null) return "";
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}