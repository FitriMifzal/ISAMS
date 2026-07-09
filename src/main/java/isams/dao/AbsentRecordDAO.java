package isams.dao;

import java.sql.*;
import java.util.*;
import isams.connection.ConnectionManager;
import isams.model.AbsentRecord;

public class AbsentRecordDAO {

	public static List<AbsentRecord> getAbsentRecordList(int classId, int subId) {
	    List<AbsentRecord> list = new ArrayList<>();

	    String sql =
	        "SELECT s.STU_ID, s.STU_NAME, s.STU_IC, " +
	        "       sub.SUB_ID, sub.SUB_NAME, sub.CREDITHOURS, " +
	        "       NVL(SUM(a.HOURS), 0) AS ABSENT_HOURS " +
	        "FROM REGISTER r " +
	        "JOIN STUDENT s ON r.STU_ID = s.STU_ID " +
	        "JOIN SUBJECT sub ON r.SUB_ID = sub.SUB_ID " +
	        "LEFT JOIN CLASS_SESSION cs ON cs.SUB_ID = sub.SUB_ID " +
	        "                         AND cs.CLASS_ID = s.CLASS_ID " +
	        "LEFT JOIN ATTENDANCE a ON a.STU_ID = s.STU_ID " +
	        "                      AND a.CLASS_SESS_ID = cs.CLASS_SESS_ID " +
	        "WHERE s.CLASS_ID = ? " +
	        "AND r.SUB_ID = ? " +
	        "GROUP BY s.STU_ID, s.STU_NAME, s.STU_IC, " +
	        "         sub.SUB_ID, sub.SUB_NAME, sub.CREDITHOURS " +
	        "ORDER BY s.STU_NAME";

	    try (
	        Connection con = ConnectionManager.getConnection();
	        PreparedStatement ps = con.prepareStatement(sql)
	    ) {
	        ps.setInt(1, classId);
	        ps.setInt(2, subId);

	        ResultSet rs = ps.executeQuery();

	        while (rs.next()) {
	            AbsentRecord record = new AbsentRecord();

	            int totalHours = rs.getInt("CREDITHOURS");
	            double absentHours = rs.getDouble("ABSENT_HOURS");
	            double attendedHours = totalHours - absentHours;

	            double attendanceRate = 0;
	            if (totalHours > 0) {
	                attendanceRate = (attendedHours / totalHours) * 100;
	            }

	            double absentRate = 100 - attendanceRate;
	            boolean barred = absentRate >= 20.0;

	            record.setStudId(rs.getInt("STU_ID"));
	            record.setStudName(rs.getString("STU_NAME"));
	            record.setStudIC(rs.getString("STU_IC"));
	            record.setSubId(rs.getInt("SUB_ID"));
	            record.setSubName(rs.getString("SUB_NAME"));
	            record.setTotalHours(totalHours);
	            record.setAbsentHours(absentHours);
	            record.setAttendedHours(attendedHours);
	            record.setAttendanceRate(attendanceRate);
	            record.setBarred(barred);

	            list.add(record);
	        }

	    } catch (Exception e) {
	        e.printStackTrace();
	    }

	    return list;
	}
}