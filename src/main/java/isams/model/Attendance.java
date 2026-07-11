package isams.model;

import java.io.Serializable;
import java.sql.Date;

public class Attendance implements Serializable {
    private static final long serialVersionUID = 1L;

    private int attendanceId;
    private Date dateRecorded;
    private String absentReasonLetter;
    private String attendanceRecord;
    private int classSessId;
    private int stuId;
    private double hours;

    public Attendance() {
    }

    public int getAttendanceId() {
        return attendanceId;
    }

    public void setAttendanceId(int attendanceId) {
        this.attendanceId = attendanceId;
    }

    public Date getDateRecorded() {
        return dateRecorded;
    }

    public void setDateRecorded(Date dateRecorded) {
        this.dateRecorded = dateRecorded;
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

    public double getHours() {
        return hours;
    }

    public void setHours(double hours) {
        this.hours = hours;
    }
}