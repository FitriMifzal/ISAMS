package isams.controller;

import java.io.IOException;
import java.io.PrintWriter;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import isams.dao.DashboardDAO;

/**
 * Author: [YOUR NAME HERE]
 * Student ID: [YOUR STUDENT ID HERE]
 * Date: July 2026
 * Purpose: ISAMS - Handles Dashboard statistics requests.
 *
 * GET ?action=getStatistics&T_ID=5 -> returns totalStudents, totalClasses,
 *     totalSubjects (subjects assigned to the given teacher)
 */

@WebServlet("/DashboardController")
public class DashboardController extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String action = request.getParameter("action");

        if ("getStatistics".equals(action)) {
            handleGetStatistics(request, out);
        } else {
            out.print("{\"status\":\"error\", \"message\":\"Unknown or missing action\"}");
        }

        out.flush();
    }

    private void handleGetStatistics(HttpServletRequest request, PrintWriter out) {
        String tIdParam = request.getParameter("T_ID");

        int totalStudents = 0;
        int totalClasses = 0;
        int totalSubjects = 0;

        if (tIdParam != null && !tIdParam.isEmpty() && !"null".equals(tIdParam)) {
            try {
                int tId = Integer.parseInt(tIdParam);
                totalStudents = DashboardDAO.getTotalStudentsForTeacher(tId);
                totalClasses = DashboardDAO.getTotalClassesForTeacher(tId);
                totalSubjects = DashboardDAO.getTotalSubjectsForTeacher(tId);
            } catch (NumberFormatException e) {
                // leave everything at 0 if T_ID wasn't a valid number
            }
        }

        StringBuilder json = new StringBuilder();
        json.append("{");
        json.append("\"totalStudents\":").append(totalStudents).append(",");
        json.append("\"totalClasses\":").append(totalClasses).append(",");
        json.append("\"totalSubjects\":").append(totalSubjects);
        json.append("}");

        out.print(json.toString());
    }
}