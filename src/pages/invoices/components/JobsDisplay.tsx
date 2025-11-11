import { Alert, Card, Chip, Skeleton, Stack, Typography } from "@mui/material";
import { useOcrJobsQuery } from "../../../store/api/ocrApi";
import { Activity } from "react";
import StatusCircle, { StatusVariant } from "../../../components/StatusCircle";
const statusMap: Record<string, string> = {
    in_progress: "In Progress",
    not_started: "Not Started",
    completed: "Completed",
    failed: "Failed"
};

const statusVariantMap: Record<string, StatusVariant> = {
    in_progress: "progress",
    not_started: "pending",
    completed: "success",
    failed: "error"
};


const JobsDisplay = () => {
    const {data: ocrJobsData, isLoading: ocrJobsLoading, error: ocrJobsError} = useOcrJobsQuery();
    
    return (
        <Stack gap={1}> 
            <Activity mode={ocrJobsLoading ? "visible" : "hidden"}>
                <Skeleton variant="rectangular" width="100%" height={40} />
                <Skeleton variant="rectangular" width="100%" height={40} />
                <Skeleton variant="rectangular" width="100%" height={40} />
            </Activity>
            <Activity mode={ocrJobsError ? "visible" : "hidden"}>
                <Alert severity="error">Error loading OCR jobs: {JSON.stringify(ocrJobsError)}</Alert>
            </Activity>
            <Activity mode={(!ocrJobsLoading && !ocrJobsError) ? "visible" : "hidden"}>
                {ocrJobsData?.length === 0 ? (
                    <Alert severity="info">No unfinnished jobs found.</Alert>
                ) : (
                    ocrJobsData?.map((job) => (
                        <Card key={job._id} sx={{ padding: 2, marginBottom: 1 }}>
                            <Typography><StatusCircle variant={statusVariantMap[job.jobStatus]}/> {statusMap[job.jobStatus] || job.jobStatus}</Typography>
                            <Typography>Created At: {new Date(job.createdAt).toLocaleString()}</Typography>
                            <Chip label={`Files: ${job.fileRefs.length}`} size="small" sx={{ marginTop: 1 }} />
                        </Card>
                    ))
                )}
            </Activity>
        </Stack>
    )

};

export default JobsDisplay;