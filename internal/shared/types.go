package shared

// Define the Health Response type
type HealthResponse struct {
	Body struct {
		Status string `json:"status" doc:"Status of the service"`
	}
}
