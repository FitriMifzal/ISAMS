package isams.model;

import java.io.Serializable;
import java.sql.Date;

public class Attendance implements Serializable {
	private static final long serialVersionUID = 1L;
	
	private int attendanceId;
    private Date date;
    private String absentReasonLetter;
    private String attendanceRecord;
    private int classSessId;
    private int stuId;

    public Attendance() {
    }

    public int getAttendanceId() {
        return attendanceId;
    }

    public void setAttendanceId(int attendanceId) {
        this.attendanceId = attendanceId;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public String getAbsentReasonLetter() {
        return absentReasonLetter;
    }

    public void setAbsentReasonLetter(String absentReasonLetter) {
        this.absentReasonLetter = absentReasonLetter;
    }

    public String getAttendanceRecord() {
        return attendanceRecord;
    }

    public void setAttendanceRecord(String attendanceRecord) {
        this.attendanceRecord = attendanceRecord;
    }

    public int getClassSessId() {
        return classSessId;
    }

    public void setClassSessId(int classSessId) {
        this.classSessId = classSessId;
    }

    public int getStuId() {
        return stuId;
    }

    public void setStuId(int stuId) {
        this.stuId = stuId;
    }
}
