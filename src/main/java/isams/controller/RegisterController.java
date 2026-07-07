package isams.controller;

import java.io.IOException;
import java.io.PrintWriter;

import isams.dao.RegisterDAO;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/RegisterController")
public class RegisterController extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("text/plain");
        response.setCharacterEncoding("UTF-8");

        PrintWriter out = response.getWriter();

        try {
            int subId = Integer.parseInt(request.getParameter("subId"));
            int stuId = Integer.parseInt(request.getParameter("stuId"));
            int classId = Integer.parseInt(request.getParameter("classId"));

            RegisterDAO.enrollStudent(subId, stuId, classId);

            out.print("success");

        } catch (Exception e) {
            e.printStackTrace();
            out.print("error");
        }
    }
}