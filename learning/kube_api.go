package main

// package essentially allows you to group these files together
// into one logical grouping w/o having to import every single file
// into others in the same package. Basically a namespace.

import (
	"context"
	"fmt"

	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
)

type KubeClient struct {
	Client    *kubernetes.Clientset
	Namespace string
	Timeout   int
}

// Init Function
func KubeClientInit(ns string) *KubeClient {
	config, err := clientcmd.BuildConfigFromFlags("", "")
	if err != nil {
		panic(err.Error())
	}

	return &KubeClient{
		Client:    kubernetes.NewForConfigOrDie(config),
		Namespace: ns,
		Timeout:   10,
	}
}

// These define "methods" related to the KubeClient type/struct
func (k *KubeClient) GetTimeoutAmount() int {
	return k.Timeout
}

func (k *KubeClient) GetClientNamespace() string {
	return k.Namespace
}

// CreateDeployment creates a new deployment with the specified name, image, and replicas
func (k *KubeClient) CreateDeployment(ctx context.Context, name string, image string, replicas int32) error {
	deploymentsClient := k.Client.AppsV1().Deployments(k.Namespace)

	deployment := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name: name,
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: &replicas, // required number of pods to have deployed at once.
			Selector: &metav1.LabelSelector{ // tells the deployment which pods it manages
				MatchLabels: map[string]string{
					"app": name,
				},
			},
			Template: corev1.PodTemplateSpec{ // Template for pod to deploy
				ObjectMeta: metav1.ObjectMeta{ // pod tag, must match selector
					Labels: map[string]string{
						"app": name,
					},
				},
				Spec: corev1.PodSpec{ // pod spec
					Containers: []corev1.Container{
						// add a single container to pod
						{
							Name:  name,
							Image: image,
							Ports: []corev1.ContainerPort{
								{
									Name:          "http",
									Protocol:      corev1.ProtocolTCP,
									ContainerPort: 80,
								},
							},
						},
					},
				},
			},
		},
	}

	fmt.Printf("Creating deployment %s...\n", name)
	result, err := deploymentsClient.Create(ctx, deployment, metav1.CreateOptions{})
	if err != nil {
		return err
	}
	fmt.Printf("Created deployment %q.\n", result.GetObjectMeta().GetName())
	return nil
}
