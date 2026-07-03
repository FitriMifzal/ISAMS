package isams.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import isams.connection.ConnectionManager;
import isams.model.Student;

/**
 * Author: [YOUR NAME HERE]
 * Student ID: [YOUR STUDENT ID HERE]
 * Date: July 2026
 * Purpose: ISAMS - Student Data Access Object
 */

public class StudentDAO {
    // do not remove
    private static Connection con = null;
    private static PreparedStatement ps = null;
    private static ResultSet rs = null;
    private static String sql;

    // insert a new student
    public static void addStudent(Student student) {
        try {
            con = ConnectionManager.getConnection();

            sql = "INSERT INTO student(stu_name, stu_ic, stu_add, stu_phonenum, class_id, student_type) VALUES(?, ?, ?, ?, ?, ?)";
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

    // update an existing student
    public static void updateStudent(Student student) {
        try {
            con = ConnectionManager.getConnection();

            sql = "UPDATE student SET stu_name=?, stu_ic=?, stu_add=?, stu_phonenum=?, class_id=?, student_type=? WHERE stu_id=?";
            ps = con.prepareStatement(sql);

            ps.setString(1, student.getStuName());
            ps.setString(2, student.getStuIC());
            ps.setString(3, student.getStuAdd());
            ps.setString(4, student.getStuPhoneNum());
            ps.setInt(5, student.getClassId());
            ps.setString(6, student.getStudentType());
            ps.setInt(7, student.getStuId());

            ps.executeUpdate();

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // delete a student
    public static void deleteStudent(int stuId) {
        try {
            con = ConnectionManager.getConnection();

            sql = "DELETE FROM student WHERE stu_id=?";
            ps = con.prepareStatement(sql);
            ps.setInt(1, stuId);

            ps.executeUpdate();

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // get one student by id
    public static Student getStudent(int stuId) {
        Student student = null;
        try {
            con = ConnectionManager.getConnection();

            sql = "SELECT * FROM student WHERE stu_id=?";
            ps = con.prepareStatement(sql);
            ps.setInt(1, stuId);

            rs = ps.executeQuery();

            if (rs.next()) {
                student = new Student();
                student.setStuId(rs.getInt("stu_id"));
                student.setStuName(rs.getString("stu_name"));
                student.setStuIC(rs.getString("stu_ic"));
                student.setStuAdd(rs.getString("stu_add"));
                student.setStuPhoneNum(rs.getString("stu_phonenum"));
                student.setClassId(rs.getInt("class_id"));
                student.setStudentType(rs.getString("student_type"));
            }

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
        return student;
    }

    // get all students, joined with classroom for display purposes
    public static List<Student> getStudents() {
        List<Student> students = new ArrayList<Student>();
        try {
            con = ConnectionManager.getConnection();

            sql = "SELECT s.*, c.classCode, c.class_name " +
                  "FROM student s " +
                  "JOIN classroom c ON s.class_id = c.class_id";
            ps = con.prepareStatement(sql);

            rs = ps.executeQuery();

            while (rs.next()) {
                Student student = new Student();
                student.setStuId(rs.getInt("stu_id"));
                student.setStuName(rs.getString("stu_name"));
                student.setStuIC(rs.getString("stu_ic"));
                student.setStuAdd(rs.getString("stu_add"));
                student.setStuPhoneNum(rs.getString("stu_phonenum"));
                student.setClassId(rs.getInt("class_id"));
                student.setStudentType(rs.getString("student_type"));
                student.setClassCode(rs.getString("classCode"));
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