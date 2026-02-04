package main

import (
	"fmt"
	"math/rand"
	"sync"
	"time"
)

func simulateWork(id int, results chan <- string, wg *sync.WaitGroup) {
	defer wg.Done() // end async when done

	fmt.Printf("Worker %d: Starting...\n", id)
	
	sleepTime := time.Duration(rand.Intn(10000)) * time.Millisecond
	time.Sleep(sleepTime)

	results <- fmt.Sprintf("Worker %d finished in %v", id, sleepTime)
}

func main() {
	var wg sync.WaitGroup // semaphore
	
	// channel to post results to
	results := make(chan string, 5)

	fmt.Println("Main: Spawning 5 goroutines...")

	for i := 1; i <= 5; i++ {
		wg.Add(1) // add total count to semaphore
		go simulateWork(i, results, &wg) // run background job
	}

	go func() {
		wg.Wait()  // wait for all results
		close(results) // close pipe 
	}()

	for msg := range results {
		fmt.Println("Main received:", msg)
	}

	fmt.Println("Main: All done!")
}

/*

Golang:
- Sempahore -> WaitGroup
- Shared Memory -> Channels (chan)
- Concurrency -> Goroutines
	- wg.Add(1)
	- wg.Wait()
	- wg.Done()

*/