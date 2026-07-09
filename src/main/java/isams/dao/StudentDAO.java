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

            sql = "INSERT INTO student(stu_name, stu_ic, stu_add, stu_phonenum, class_id, student_type) "
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

            sql = "UPDATE student SET stu_name=?, stu_ic=?, stu_add=?, stu_phonenum=?, class_id=? "
                + "WHERE stu_id=?";

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
                "DELETE FROM SVM WHERE STU_ID=?",
                "DELETE FROM DVM WHERE STU_ID=?",
                "DELETE FROM ATTENDANCE WHERE STU_ID=?",
                "DELETE FROM REGISTER WHERE STU_ID=?",
                "DELETE FROM STUDENT WHERE STU_ID=?"
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

    public static Student getStudent(int id) {
        Student student = null;

        try {
            con = ConnectionManager.getConnection();

            sql = "SELECT s.stu_id, s.stu_name, s.stu_ic, s.stu_add, s.stu_phonenum, "
                + "s.class_id, s.student_type, "
                + "c.classcode, c.class_name, "
                + "svm.cgpa_a, svm.cgpa_v, "
                + "dvm.repeatpaper "
                + "FROM student s "
                + "LEFT JOIN classroom c ON s.class_id = c.class_id "
                + "LEFT JOIN svm ON s.stu_id = svm.stu_id "
                + "LEFT JOIN dvm ON s.stu_id = dvm.stu_id "
                + "WHERE s.stu_id = ?";

            ps = con.prepareStatement(sql);
            ps.setInt(1, id);

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
                student.setClassCode(rs.getString("classcode"));
                student.setClassName(rs.getString("class_name"));

                double cgpaA = rs.getDouble("cgpa_a");
                if (!rs.wasNull()) {
                    student.setCgpaA(cgpaA);
                }

                double cgpaV = rs.getDouble("cgpa_v");
                if (!rs.wasNull()) {
                    student.setCgpaV(cgpaV);
                }

                int repeatPaper = rs.getInt("repeatpaper");
                if (!rs.wasNull()) {
                    student.setRepeatPaper(repeatPaper);
                }
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
                + "ORDER BY s.stu_id";

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