package isams.dao;

import java.sql.*;
import java.util.*;
import isams.connection.ConnectionManager;
import isams.model.Attendance;

public class AttendanceDAO {

    public int getOrCreateSession(int subId, int classId, String date) {
        int classSessId = 0;

        try {
            Connection con = ConnectionManager.getConnection();

            String checkSql =
                "SELECT CLASS_SESS_ID FROM CLASS_SESSION " +
                "WHERE SUB_ID = ? AND CLASS_ID = ? " +
                "AND SESSION_DATE = TO_DATE(?, 'YYYY-MM-DD')";

            PreparedStatement ps = con.prepareStatement(checkSql);
            ps.setInt(1, subId);
            ps.setInt(2, classId);
            ps.setString(3, date);

            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                classSessId = rs.getInt("CLASS_SESS_ID");
            } else {
                String insertSql =
                    "INSERT INTO CLASS_SESSION " +
                    "(SUB_ID, CLASS_ID, SESSION_DATE, SESSION_TIME) " +
                    "VALUES (?, ?, TO_DATE(?, 'YYYY-MM-DD'), ?)";

                PreparedStatement ps2 = con.prepareStatement(
                    insertSql,
                    new String[] { "CLASS_SESS_ID" }
                );

                ps2.setInt(1, subId);
                ps2.setInt(2, classId);
                ps2.setString(3, date);
                ps2.setString(4, "-");

                ps2.executeUpdate();

                ResultSet key = ps2.getGeneratedKeys();

                if (key.next()) {
                    classSessId = key.getInt(1);
                }
            }

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return classSessId;
    }

    public List<Attendance> getStudentsForAttendance(int subId, int classId, String date) {
        List<Attendance> list = new ArrayList<>();

        int classSessId = getOrCreateSession(subId, classId, date);

        String sql =
        	    "SELECT s.STUD_ID, s.STUD_NAME, s.STUD_IC, a.STUD_ID AS ABSENT_STUD_ID " +
        	    "FROM REGISTER r " +
        	    "JOIN STUDENT s ON r.STUD_ID = s.STUD_ID " +
        	    "LEFT JOIN ATTENDANCE a " +
        	    "ON s.STUD_ID = a.STUD_ID " +
        	    "AND a.CLASS_SESS_ID = ? " +
        	    "WHERE r.SUB_ID = ? " +
        	    "AND r.CLASS_ID = ? " +
        	    "ORDER BY s.STUD_NAME";

        try {
            Connection con = ConnectionManager.getConnection();

            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, classSessId);
            ps.setInt(2, subId);
            ps.setInt(3, classId);

            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                Attendance a = new Attendance();

                a.setClassSessId(classSessId);
                a.setStudId(rs.getInt("STUD_ID"));
                a.setStudName(rs.getString("STUD_NAME"));
                a.setStudIC(rs.getString("STUD_IC"));
                a.setAbsent(rs.getString("ABSENT_STUD_ID") != null);

                list.add(a);
            }

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }
    
    public boolean insertAbsent(String date, int tId, int classSessId, int classId, int studId, double hours) {
        boolean success = false;

        try {
            Connection con = ConnectionManager.getConnection();

            String sql =
                "INSERT INTO ATTENDANCE " +
                "(ATT_DATE, T_ID, CLASS_SESS_ID, CLASS_ID, STUD_ID, ATTENDANCERECORD) " +
                "SELECT TO_DATE(?, 'YYYY-MM-DD'), ?, ?, ?, ?, ? " + 
                "FROM dual " +
                "WHERE NOT EXISTS ( " +
                "SELECT 1 FROM ATTENDANCE " +
                "WHERE ATT_DATE = TO_DATE(?, 'YYYY-MM-DD') " +
                "AND T_ID = ? " +
                "AND CLASS_SESS_ID = ? " +
                "AND STUD_ID = ? " +
                ")";

            PreparedStatement ps = con.prepareStatement(sql);

            ps.setString(1, date);
            ps.setInt(2, tId);
            ps.setInt(3, classSessId);
            ps.setInt(4, classId);
            ps.setInt(5, studId);
            ps.setDouble(6, hours);     

            ps.setString(7, date);
            ps.setInt(8, tId);
            ps.setInt(9, classSessId);
            ps.setInt(10, studId);

            int row = ps.executeUpdate();
            System.out.println("ATTENDANCE INSERT ROW = " + row);

            success = row > 0;

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return success;
    }

    public void deleteAbsent(String date, int tId, int classSessId, int studId) {
        try {
            Connection con = ConnectionManager.getConnection();

            String sql =
                "DELETE FROM ATTENDANCE " +
                "WHERE CLASS_SESS_ID = ? " +
                "AND STUD_ID = ?";

            PreparedStatement ps = con.prepareStatement(sql);

            ps.setInt(1, classSessId);
            ps.setInt(2, studId);

            int row = ps.executeUpdate();
            System.out.println("ATTENDANCE DELETE ROW = " + row);

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}