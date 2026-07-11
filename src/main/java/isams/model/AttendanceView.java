package isams.model;

import java.io.Serializable;

/**
 * DTO (Data Transfer Object) - NOT a database entity.
 * Combines Student info (joined) with a simplified attendance status,
 * purely for displaying the "Load Attendance" grid on screen.
 * Does not map to any single table.
 */
public class AttendanceView implements Serializable {
    private static final long serialVersionUID = 1L;

    private int classSessId;
    private int stuId;
    private String stuName;
    private String stuIC;
    private boolean absent;

    public AttendanceView() {
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

    public String getStuName() {
        return stuName;
    }

    public void setStuName(String stuName) {
        this.stuName = stuName;
    }

    public String getStuIC() {
        return stuIC;
    }

    public void setStuIC(String stuIC) {
        this.stuIC = stuIC;
    }

    public boolean isAbsent() {
        return absent;
    }

    public void setAbsent(boolean absent) {
        this.absent = absent;
    }
}
