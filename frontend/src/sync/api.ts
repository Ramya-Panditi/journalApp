import axios from "axios"
import { baseURL } from "../link"
import { frontendEntry, jounrnalEntry } from "../hooks/query.type";


export const getData = async ()=>{
   const response = await axios.get(`${baseURL}/allEntries`);
   console.log(response.data);
   return response.data;

}
export const addNote = async (data : frontendEntry)=>{
   const response = await axios.post(`${baseURL}/addNotes`, data );
   console.log(response.data);
   return response.data;
}
export const deleteNote = async (id: string)=>{
   const response = await axios.delete(`${baseURL}/deleteNotes/${id}`);
   console.log(response.data);
   return response.data;
}

export const updateNote = async(data:jounrnalEntry) =>{
   const response = await axios.put(`${baseURL}/updateNotes`,data);
   return response.data;
   
}