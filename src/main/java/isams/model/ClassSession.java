package isams.model;

import java.io.Serializable;
import java.sql.Date;

public class ClassSession implements Serializable {
	private static final long serialVersionUID = 1L;
	
	private int classSessId;
    private int subId;
    private int classId;
    private Date sessionDate;
    private String sessionTime;

    public ClassSession() {
    }

    public int getClassSessId() {
        return classSessId;
    }

    public void setClassSessId(int classSessId) {
        this.classSessId = classSessId;
    }

    public int getSubId() {
        return subId;
    }

    public void setSubId(int subId) {
        this.subId = subId;
    }

    public int getClassId() {
        return classId;
    }

    public void setClassId(int classId) {
        this.classId = classId;
    }

    public Date getSessionDate() {
        return sessionDate;
    }

    public void setSessionDate(Date sessionDate) {
        this.sessionDate = sessionDate;
    }

    public String getSessionTime() {
        return sessionTime;
    }

    public void setSessionTime(String sessionTime) {
        this.sessionTime = sessionTime;
    }
}
