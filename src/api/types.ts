import { MachineStatus } from "./MachineStatus";

export class Job {
    public static reviver(key: string, value: any): any {
        if ((key === "TimeCreated" || key === "TimeCompleted") && typeof value === "string") {
            return new Date(value);
        }
        return value;
    }

    public AbsoluteFilename: string = '';
    public Filename: string = '';
    public Hostname: string = '';
    public TimeCreated: Date | null = null;
    public ProgressText: string | null = null;
    public Progress: number | null = null;
    public Paused: boolean = false;
    public Cancelled: boolean = false;
    public TimeLeft: number | null = null;
    public TimeCompleted: string | null = null;
}

export class Printer {
    public Name: string = '';
    public Hostname: string = '';
    public Status: MachineStatus = MachineStatus.off;
    public Online: boolean = false;
    public Suspended: boolean = false;
    public JobFile: string | null = null;
}
