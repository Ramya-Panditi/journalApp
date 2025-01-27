import { useQuery, UseQueryOptions,useMutation,UseMutationOptions} from "@tanstack/react-query";
import { getData,addNote, deleteNote,updateNote} from "../sync/api";
import { jounrnalEntry,frontendEntry} from "./query.type";


export const useTasks = () => {
    const options: UseQueryOptions<jounrnalEntry[], Error> = {
      queryKey: ["entries"],  
      queryFn: getData,     
    };
  
    return useQuery<jounrnalEntry[], Error>(options); 
};

export const useAddNote = () => {
  const mutation = useMutation({
    mutationFn: (newNote: frontendEntry) => {
      return addNote(newNote); 
    },
    onSuccess: (data) => {
      console.log("Note added successfully:", data);
    },
    onError: (error: Error) => {
      console.error("Error adding note:", error);
    },
    onSettled: () => {
      console.log("Mutation completed");
    },
  });

  return mutation;
};

export const useDeleteNote = () =>{
  const mutation = useMutation({
    mutationFn: (id:string) => {
      return deleteNote(id); 
    },
    onSuccess: (data) => {
      console.log("Note deleted successfully:", data);
    },
    onError: (error: Error) => {
      console.error("Error deleted note:", error);
    },
    onSettled: () => {
      console.log("Mutation completed");
    },
  });

  return mutation;
}

export const useUpdateNote = ()=>{
  const mutation = useMutation({
    mutationFn:(data:jounrnalEntry)=>{
      return updateNote(data);
    },
    onSuccess: (data) => {
      console.log("Note deleted successfully:", data);
    },
    onError: (error: Error) => {
      console.error("Error deleted note:", error);
    },
    onSettled: () => {
      console.log("Mutation completed");
    },

  });
  return mutation;
}