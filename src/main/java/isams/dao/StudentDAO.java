package isams.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

import isams.connection.ConnectionManager;
import isams.model.Student;

public class StudentDAO {

    private static Connection con = null;
    private static PreparedStatement ps = null;
    private static ResultSet rs = null;
    private static String sql;

    public static void addStudent(Student student) {
        try {
            con = ConnectionManager.getConnection();

            sql = "INSERT INTO student(stud_name, stud_ic, stud_add, contact_no, class_id, student_type) "
                + "VALUES (?, ?, ?, ?, ?, ?)";

            ps = con.prepareStatement(sql);
            ps.setString(1, student.getStuName());
            ps.setString(2, student.getStuIC());
            ps.setString(3, student.getStuAdd());
            ps.setString(4, student.getStuPhoneNum());
            ps.setInt(5, student.getClassId());
            ps.setString(6, student.getStudentType());

            ps.executeUpdate();
            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void updateStudent(Student student) {
        try {
            con = ConnectionManager.getConnection();

            sql = "UPDATE student SET stud_name=?, stud_ic=?, stud_add=?, contact_no=?, class_id=? "
                + "WHERE stud_id=?";

            ps = con.prepareStatement(sql);
            ps.setString(1, student.getStuName());
            ps.setString(2, student.getStuIC());
            ps.setString(3, student.getStuAdd());
            ps.setString(4, student.getStuPhoneNum());
            ps.setInt(5, student.getClassId());
            ps.setInt(6, student.getStuId());

            ps.executeUpdate();
            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void deleteStudent(int stuId) {
        try {
            con = ConnectionManager.getConnection();

            String[] sqlList = {
                "DELETE FROM SVM WHERE STUD_ID=?",
                "DELETE FROM DVM WHERE STUD_ID=?",
                "DELETE FROM ATTENDANCE WHERE STUD_ID=?",
                "DELETE FROM REGISTER WHERE STUD_ID=?",
                "DELETE FROM STUDENT WHERE STUD_ID=?"
            };

            for (String q : sqlList) {
                ps = con.prepareStatement(q);
                ps.setInt(1, stuId);
                ps.executeUpdate();
            }

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static Student getStudent(int stuId) {
        Student student = null;

        try {
            con = ConnectionManager.getConnection();

            sql = "SELECT s.*, c.classcode, c.class_name "
                + "FROM student s "
                + "JOIN classroom c ON s.class_id = c.class_id "
                + "WHERE s.stud_id=?";

            ps = con.prepareStatement(sql);
            ps.setInt(1, stuId);

            rs = ps.executeQuery();

            if (rs.next()) {
                student = new Student();
                student.setStuId(rs.getInt("stud_id"));
                student.setStuName(rs.getString("stud_name"));
                student.setStuIC(rs.getString("stud_ic"));
                student.setStuAdd(rs.getString("stud_add"));
                student.setStuPhoneNum(rs.getString("contact_no"));
                student.setClassId(rs.getInt("class_id"));
                student.setStudentType(rs.getString("student_type"));
                student.setClassCode(rs.getString("classcode"));
                student.setClassName(rs.getString("class_name"));
            }

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return student;
    }

    public static List<Student> getStudents() {
        List<Student> students = new ArrayList<Student>();

        try {
            con = ConnectionManager.getConnection();

            sql = "SELECT s.*, c.classcode, c.class_name "
                + "FROM student s "
                + "JOIN classroom c ON s.class_id = c.class_id "
                + "ORDER BY s.stud_id";

            ps = con.prepareStatement(sql);
            rs = ps.executeQuery();

            while (rs.next()) {
                Student student = new Student();
                student.setStuId(rs.getInt("stud_id"));
                student.setStuName(rs.getString("stud_name"));
                student.setStuIC(rs.getString("stud_ic"));
                student.setStuAdd(rs.getString("stud_add"));
                student.setStuPhoneNum(rs.getString("contact_no"));
                student.setClassId(rs.getInt("class_id"));
                student.setStudentType(rs.getString("student_type"));
                student.setClassCode(rs.getString("classcode"));
                student.setClassName(rs.getString("class_name"));

                students.add(student);
            }

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return students;
    }
}