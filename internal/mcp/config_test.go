package mcp

import (
	"os/exec"
	"testing"
)

func TestDefaultK8sConfig(t *testing.T) {
	cfg := DefaultK8sConfig()
	if cfg.Command != "npx" {
		t.Errorf("Command = %q, want npx", cfg.Command)
	}
	if len(cfg.Args) != 2 || cfg.Args[0] != "-y" || cfg.Args[1] != "kubernetes-mcp-server@latest" {
		t.Errorf("Args = %v", cfg.Args)
	}
}

func TestWithReadOnly(t *testing.T) {
	cfg := DefaultK8sConfig().WithReadOnly()
	want := "--read-only"
	got := false
	for _, a := range cfg.Args {
		if a == want {
			got = true
			break
		}
	}
	if !got {
		t.Errorf("WithReadOnly: Args = %v, want to contain %q", cfg.Args, want)
	}
}

func TestWithKubeconfig(t *testing.T) {
	cfg := DefaultK8sConfig().WithKubeconfig("/path/to/kubeconfig")
	if len(cfg.Args) < 4 {
		t.Errorf("WithKubeconfig: Args = %v", cfg.Args)
	}
	// Should end with --kubeconfig and path
	n := len(cfg.Args)
	if cfg.Args[n-2] != "--kubeconfig" || cfg.Args[n-1] != "/path/to/kubeconfig" {
		t.Errorf("WithKubeconfig: last Args = %v", cfg.Args[n-2:])
	}
}

func TestCmd(t *testing.T) {
	cfg := DefaultK8sConfig()
	cmd := cfg.Cmd()
	if cmd == nil {
		t.Fatal("Cmd() returned nil")
	}
	if cmd.Path != "" {
		// exec.Command doesn't set Path until it's resolved
		_ = cmd.Path
	}
	if cmd.Args[0] != "npx" {
		t.Errorf("Cmd.Args[0] = %q", cmd.Args[0])
	}
	// Cmd should be runnable (or at least buildable)
	if _, err := exec.LookPath(cfg.Command); err != nil {
		t.Logf("npx not in PATH (optional): %v", err)
	}
}
