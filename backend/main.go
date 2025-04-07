package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/rs/cors"

	"github.com/couchbase/gocb/v2"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

var cluster *gocb.Cluster
var bucket *gocb.Bucket

type Entry struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

func initCouchbase() {
	var err error
	err1 := godotenv.Load()
	if err1 != nil {
		log.Fatal("Error loading .env file")
	}

	cluster, err = gocb.Connect("couchbases://cb.tkrn7iagiptbdlj.cloud.couchbase.com", gocb.ClusterOptions{
		Username: os.Getenv("COUCHBASE_USERNAME"),
		Password: os.Getenv("COUCHBASE_PASSWORD"),
	})

	if err != nil {
		log.Fatalf("Failed to connect to Couchbase: %v", err)
	}

	bucket = cluster.Bucket("todo")
	fmt.Println(bucket)
	err = bucket.WaitUntilReady(5*time.Second, nil)
	if err != nil {
		log.Fatalf("Bucket not ready: %v", err)
	}
}

func addNew(w http.ResponseWriter, r *http.Request) {
	var newtask Entry
	err := json.NewDecoder(r.Body).Decode(&newtask)
	if err != nil {
		http.Error(w, "Error in req body or invalid", http.StatusBadGateway)

	}
	cbcounterkey := "taskCounter"

	scope := bucket.Scope("todoscope")
	collection := scope.Collection("list")
	_, err = collection.Binary().Increment(cbcounterkey, &gocb.IncrementOptions{
		Initial: 110,
		Delta:   1,
	})

	if err != nil {
		log.Printf("Error incrementing counter: %v", err)
		http.Error(w, "Couldn't increment counter", http.StatusInternalServerError)
		return
	}
	result, err := collection.Get(cbcounterkey, &gocb.GetOptions{})
	if err != nil {
		log.Printf("Error getting counter value: %v", err)
		http.Error(w, "Couldn't retrieve counter value", http.StatusInternalServerError)
		return
	}
	if err != nil {
		panic(err)
	}
	var value int
	if err := result.Content(&value); err != nil {
		panic(err)
	}
	newtask.ID = strconv.Itoa(value)

	_, err = collection.Insert(newtask.ID, newtask, nil)
	if err != nil {
		http.Error(w, "Couldn't insert the doc", http.StatusInternalServerError)
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newtask)

}
func deleteNotes(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Im in delete")
	params := mux.Vars(r)
	taskID := params["id"]
	fmt.Fprintf(w, "Deleting task with ID: %s\n", taskID)
	scope := bucket.Scope("todoscope")
	collection := scope.Collection("list")

	removeResult, err := collection.Remove(taskID, &gocb.RemoveOptions{
		Timeout:         100 * time.Millisecond,
		DurabilityLevel: gocb.DurabilityLevelMajority,
	})
	if err != nil {
		panic(err)
	}
	fmt.Print(removeResult.Result)

}

func updateNotes(w http.ResponseWriter, r *http.Request) {
	fmt.Println("In edit function lol")
	scope := bucket.Scope("todoscope")
	collection := scope.Collection("list")
	var editNote Entry
	err := json.NewDecoder(r.Body).Decode(&editNote)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error decoding the request body: %v", err), http.StatusBadRequest)
		return
	}

	_, err = collection.Upsert(editNote.ID, &editNote, &gocb.UpsertOptions{
		Timeout: 2 * time.Second,
		Expiry:  60 * time.Second,
	})
	if err != nil {
		http.Error(w, fmt.Sprintf("Error during upsert operation: %v", err), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(editNote)
}

func getEntries(w http.ResponseWriter, r *http.Request) {
	fmt.Println("hey im being called")

	query := "SELECT META().id,title,description FROM todo.todoscope.list"
	data, err := cluster.Query(query, &gocb.QueryOptions{})
	if err != nil {
		http.Error(w, "Can't get the tasks Oops", http.StatusInternalServerError)
	}
	var tasks []Entry
	for data.Next() {
		var task Entry
		err := data.Row(&task)
		if err != nil {
			http.Error(w, "Failed to parse task", http.StatusInternalServerError)
			return
		}
		tasks = append(tasks, task)

	}
	fmt.Print(tasks)

	if len(tasks) == 0 {
		http.Error(w, "No tasks found", http.StatusNoContent)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	json.NewEncoder(w).Encode(tasks)
}

func main() {
	initCouchbase()
	r := mux.NewRouter()
	corsHandler := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:5173"},        // Allow React front-end running on port 3000
		AllowedMethods: []string{"GET", "POST", "DELETE", "PUT"}, // Allowed HTTP methods
		AllowedHeaders: []string{"Content-Type", "Authorization"},
	})
	r.HandleFunc("/allEntries", getEntries)
	r.HandleFunc("/addNotes", addNew).Methods("POST")
	r.HandleFunc("/deleteNotes/{id}", deleteNotes).Methods("DELETE")
	r.HandleFunc("/updateNotes", updateNotes).Methods("PUT")
	fmt.Println("Server running on : 4000")
	handler := corsHandler.Handler(r)
	http.ListenAndServe(":8000", handler)

}
