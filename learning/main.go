package main

import "context"

func main() {
	KubeClient := KubeClientInit("default")
	KubeClient.CreateDeployment(context.TODO(), "test", "alpine:3.22", 3)
}
