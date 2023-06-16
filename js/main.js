"use strict";


// Obtención de referencias a elementos del DOM
const btnAdd = document.querySelector(".btn-add_main");
const add = document.querySelector('.addNombres');




// Event listener para mostrar/ocultar el formulario al hacer clic en el botón "Add"
btnAdd.addEventListener('click', () =>{
   add.classList.toggle('show'); 
   let nombre = document.getElementById("name");
   let precio = document.getElementById("precio");
   let cantidad = document.getElementById("cantidad");
   nombre.value = '';
   precio.value = '';
   cantidad.value = '';
})


// Apertura de la base de datos indexada ("luisbase") con versión 1
const IDBRequest = indexedDB.open("luisdatabase",1);   


// Evento que se dispara cuando la base de datos necesita actualizarse (creación de un almacén de objetos llamado "nombres")
IDBRequest.addEventListener("upgradeneeded",()=>{
   const db = IDBRequest.result;
   db.createObjectStore("nombres",{
      autoIncrement: true
   });
})


// Evento que se dispara cuando la base de datos se abre con éxito
IDBRequest.addEventListener("success",()=>{
   readObjeto();
   obtenerCantidadElementos();
})



// Event listener para el botón "Add" en el formulario
document.getElementById("add").addEventListener("click",()=>{
   let nombre = document.getElementById("name").value;
   const cantidad = document.getElementById("cantidad").value;
   const precio = document.getElementById("precio").value;
   if (nombre.length > 0 && cantidad.length > 0 && precio.length > 0){
      if (document.querySelector(".posible") != undefined) {
         if (confirm("hay elementos sin guardar; ¿Quieres continuar?"))
         addObjeto({ nombre, cantidad, precio });
      } else {
         addObjeto({ nombre, cantidad, precio });
         readObjeto();
      }
   }
})




// Función para obtener una transacción y un almacén de objetos de la base de datos indexada según el modo y un mensaje dado
const getIDBData = (mode,msg)=> {
   const db = IDBRequest.result;
   const IDBtransaction = db.transaction("nombres",mode);
   const objectStore = IDBtransaction.objectStore("nombres"); 
   IDBtransaction.addEventListener("complete",()=>{ 
      console.log(msg)
   })
   return objectStore;
}





// Función para agregar un objeto a la base de datos indexada
const addObjeto = objeto => {
   const IDBData = getIDBData("readwrite","objeto agregado correctamente");
   IDBData.add(objeto)    
   add.classList.toggle('show'); 
   obtenerCantidadElementos();
}


// Función para leer y mostrar todos los objetos de la base de datos indexada
const readObjeto = ()=>{
   const IDBData = getIDBData("readonly");
   const cursor = IDBData.openCursor();
   const fragmento = document.createDocumentFragment();
   document.querySelector(".nombres").innerHTML = "";
   const keys = []; // Array para almacenar las keys de los elementos

   cursor.addEventListener("success",()=>{
      if (cursor.result) {     
         const key = cursor.result.key; // Obtiene la key del elemento actual
         keys.push(key); // Agrega la key al array

         let elemento = nombresHTML(key, cursor.result.value, key)                                
         fragmento.appendChild(elemento)
         cursor.result.continue();
      }
      else {
         document.querySelector(".nombres").appendChild(fragmento)
      } 
   })
}


// Función para modificar un objeto en la base de datos indexada
const modfObjeto = (key,objeto) => {
   const IDBData = getIDBData("readwrite","objeto modificado correctamente");  
   if(confirm(`¿Esta seguro de modificar este elemento?`)){
      IDBData.put(objeto,key);  
   }                                 
}




// Función para eliminar un objeto de la base de datos indexada
const borrarObjeto = key => {
   const IDBData = getIDBData("readwrite","objeto eliminado correctamente");
   if(confirm(`¿Esta seguro de eliminar este elemento?`)){
      IDBData.delete(key) 
   }
   obtenerCantidadElementos();                                         
}






const obtenerCantidadElementos = () => {
   const cantidadElementos = document.querySelector('.cantidad');
   const IDBData = getIDBData("readonly");
   const request = IDBData.count();

   request.addEventListener("success", () => {
      const count = request.result;
      cantidadElementos.textContent = count;
   });
};














// Función para crear el HTML correspondiente a un objeto de la base de datos indexada
const nombresHTML = (id, data, key) => {
   const container = document.createElement("DIV");
   const nombreElement = document.createElement("H2");
   const cantidadElement = document.createElement("p");
   const precioElement = document.createElement("p");
   const idElement = document.createElement("p");
   const options = document.createElement("DIV");
   const saveButton = document.createElement("BUTTON");
   const deleteButton = document.createElement("BUTTON");

   container.classList.add("producto");
   options.classList.add("options");
   saveButton.classList.add("imposible");
   deleteButton.classList.add("delete");

   saveButton.innerHTML = `
      <i class="las la-save"></i>
   `;
   deleteButton.innerHTML = `
      <i class="las la-trash-alt"></i>
   `;


   idElement.textContent = key;
   nombreElement.textContent = data.nombre;
   nombreElement.setAttribute("contenteditable","true");
   nombreElement.setAttribute("spellcheck","false");

   precioElement.textContent = data.precio;
   cantidadElement.textContent = data.cantidad;


   options.appendChild(saveButton);
   options.appendChild(deleteButton);



   container.appendChild(idElement);
   container.appendChild(nombreElement);
   container.appendChild(precioElement);
   container.appendChild(cantidadElement);
   container.appendChild(options);
   
   // Event listener para habilitar el botón "Guardar" cuando se realice una edición en el nombre
   nombreElement.addEventListener("keyup",()=> {
      saveButton.classList.replace("imposible","posible")
   })

   // Event listener para guardar los cambios al hacer clic en el botón "Guardar"
   saveButton.addEventListener("click",()=>{
      if (saveButton.className == "posible") {
         modfObjeto(id, { ...data, nombre: nombreElement.textContent });
         saveButton.classList.replace("posible","imposible");
      }
   })

   // Event listener para eliminar el objeto al hacer clic en el botón "Eliminar"
   deleteButton.addEventListener("click",()=>{
      borrarObjeto(id);
      document.querySelector(".nombres").removeChild(container)
   })


   return container;

}























































































