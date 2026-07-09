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
    private String toJson(Student student) {
        String cgpaAJson = student.getCgpaA() == null ? "null" : student.getCgpaA().toString();
        String cgpaVJson = student.getCgpaV() == null ? "null" : student.getCgpaV().toString();
        String repeatPaperJson = student.getRepeatPaper() == null ? "null" : student.getRepeatPaper().toString();

        return "{"
                + "\"stuId\":" + student.getStuId() + ","
                + "\"stuName\":\"" + escapeJson(student.getStuName()) + "\","
                + "\"stuIC\":\"" + escapeJson(student.getStuIC()) + "\","
                + "\"stuAdd\":\"" + escapeJson(student.getStuAdd()) + "\","
                + "\"stuPhoneNum\":\"" + escapeJson(student.getStuPhoneNum()) + "\","
                + "\"classId\":" + student.getClassId() + ","
                + "\"classCode\":\"" + escapeJson(student.getClassCode()) + "\","
                + "\"className\":\"" + escapeJson(student.getClassName()) + "\","
                + "\"studentType\":\"" + escapeJson(student.getStudentType()) + "\","
                + "\"cgpaA\":" + cgpaAJson + ","
                + "\"cgpaV\":" + cgpaVJson + ","
                + "\"repeatPaper\":" + repeatPaperJson
                + "}";
    }

    // prevent broken JSON if text contains quotes
    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }

        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}