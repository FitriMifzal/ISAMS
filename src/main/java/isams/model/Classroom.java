package isams.model;

import java.io.Serializable;

public class Classroom implements Serializable {
	private static final long serialVersionUID = 1L;
	
	private int classId;
	private String classCode;
    private String className;

    public Classroom() {
    }

    public int getClassId() {
        return classId;
    }

    public void setClassId(int classId) {
        this.classId = classId;
    }
    
    public String getClassName() {
        return className;
    }
    
    public void setClassName(String className) {
        this.className = className;
    }
    
    public String getClassCode() {
        return classCode;
    }

    public void setClassCode(String classCode) {
        this.classCode = classCode;
    }

}
