package isams.model;

public class DVM extends Student {
    private static final long serialVersionUID = 1L;

    private Integer repeatPaper;

    public DVM() {
        super();
    }

    public Integer getRepeatPaper() {
        return repeatPaper;
    }

    public void setRepeatPaper(Integer repeatPaper) {
        this.repeatPaper = repeatPaper;
    }
}