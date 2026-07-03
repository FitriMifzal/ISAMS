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

           
            sql = "INSERT INTO student(stuName, stuIC, stuAdd, stuPhoneNum, classId) VALUES(?, ?, ?, ?, ?)";
            ps = con.prepareStatement(sql);

            ps.setString(1, student.getStuName());
            ps.setString(2, student.getStuIC());
            ps.setString(3, student.getStuAdd());
            ps.setString(4, student.getStuPhoneNum());
            ps.setInt(5, student.getClassId());

            
            ps.executeUpdate();

          
            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    //updateStudent() method
    public static void updateStudent(Student student) {
        try {
            
            con = ConnectionManager.getConnection();

            
            sql = "UPDATE student SET stuName=?, stuIC=?, stuAdd=?, stuPhoneNum=?, classId=? WHERE stuId=?";
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

            
            sql = "DELETE FROM student WHERE stuId=?";
            ps = con.prepareStatement(sql);
            ps.setInt(1, stuId);

            
            ps.executeUpdate();

            
            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    
    public static Student getStudent(int stuId) {
        Student student = null;
        try {
           
            con = ConnectionManager.getConnection();

            
            sql = "SELECT * FROM student WHERE stuId=?";
            ps = con.prepareStatement(sql);
            ps.setInt(1, stuId);

            
            rs = ps.executeQuery();

            if (rs.next()) {
                student = new Student();
                student.setStuId(rs.getInt("stuId"));
                student.setStuName(rs.getString("stuName"));
                student.setStuIC(rs.getString("stuIC"));
                student.setStuAdd(rs.getString("stuAdd"));
                student.setStuPhoneNum(rs.getString("stuPhoneNum"));
                student.setClassId(rs.getInt("classId"));
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

            
            sql = "SELECT * FROM student";
            ps = con.prepareStatement(sql);

            
            rs = ps.executeQuery();

            while (rs.next()) {
                Student student = new Student();
                student.setStuId(rs.getInt("stuId"));
                student.setStuName(rs.getString("stuName"));
                student.setStuIC(rs.getString("stuIC"));
                student.setStuAdd(rs.getString("stuAdd"));
                student.setStuPhoneNum(rs.getString("stuPhoneNum"));
                student.setClassId(rs.getInt("classId"));
                students.add(student);
            }

            
            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
        return students;
    }
}