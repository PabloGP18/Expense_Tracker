"use client";
import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";

export default function Home() {
  const [items, setItems] = useState([]);

  const [newItem, setNewItem] = useState({ name: "", price: "" });

  const [total, setTotal] = useState(0);

  const [message, setMessage] = useState({
    name: "",
    price: "",
  });

  // ADD ITEM TO DB

  const handleChange = (e) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
    console.log(newItem);
    setMessage([]);
  };

  const addItem = async (e) => {
    e.preventDefault();

    if (newItem.name === "" && newItem.price === "") {
      setMessage({
        name: " Enter item!",
        price: " Enter $!",
      });
    } else if (newItem.name === "") {
      setMessage({
        name: "Enter item!",
        price: "",
      });
    } else if (newItem.price === "") {
      setMessage({
        name: "",
        price: "Enter $!",
      });
    } else {
      await addDoc(collection(db, "items"), {
        name: newItem.name.trim(),
        price: newItem.price,
      });
      setNewItem({ name: "", price: "" });
      setMessage({
        name: "",
        price: "",
      });
    }
  };

  // READ ITEMS FROM DB

  /* In this function, query constructs a query to fetch data from the Firestore 'items' collection,
  and onSnapshot sets up a real-time listener on that query,
  which triggers every time the data in the collection changes and provides a snapshot of the new state.*/

  useEffect(() => {
    const q = query(collection(db, "items"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let itemsArr = [];

      querySnapshot.forEach((doc) => {
        itemsArr.push({ ...doc.data(), id: doc.id });
      });
      setItems(itemsArr);

      // Read total from itemsArr
      const calculateTotal = () => {
        const totalPrice = itemsArr.reduce(
          (sum, item) => sum + parseFloat(item.price),
          0
        );
        setTotal(totalPrice);
      };
      calculateTotal();
      return () => unsubscribe();
    });
  }, []);

  // DELETE ITEMS FROM DB
  const deleteItem = async (id) => {
    await deleteDoc(doc(db, "items", id));
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between sm:p-24 p-4 ">
      <div className="z-10 w-full max-w-3xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl p-4 text-center">Expense Tracker</h1>
        <div className="bg-slate-800 p-4 rounded-lg">
          <form className="grid grid-cols-6 items-center text-black">
            <input
              value={newItem.name}
              name="name"
              className={`col-span-3 p-3 border ${
                message.name
                  ? "placeholder-red-600  border-red-600 border-4"
                  : ""
              }`}
              type="text"
              placeholder={message.name ? message.name : "Enter Item"}
              onChange={handleChange}
            />

            <input
              value={newItem.price}
              name="price"
              className={`col-span-2 p-3 border mx-3 ${
                message.price
                  ? "placeholder-red-600 border-red-600 border-4"
                  : ""
              }`}
              type="number"
              placeholder={message.price ? message.price : "Enter $"}
              onChange={handleChange}
            />
            <button
              className="text-white hover:bg-slate-900 p-3 text-xl"
              type="submit"
              onClick={addItem}
            >
              +
            </button>
            {/* {message &&
              message.map((mes, index) => (
                <div className="p-4 w-full flex justify-between" key={index}>
                  <span className="text-red-700 text-2xl">{mes.name}</span>
                  <span className="text-red-700 text-2xl">{mes.price}</span>
                </div>
              ))} */}
          </form>
          <ul className="max-h-[350px] overflow-y-scroll">
            {items.map((item, id) => (
              <li
                key={id}
                className="my-4 w-full flex justify-between bg-slate-950 "
              >
                <div className="p-4 w-full flex justify-between">
                  <span className="capitalize ">{item.name}</span>
                  <span>${item.price}</span>
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="ml-8 border-l-2 border-slate-900 hover:bg-slate-900 w-16"
                >
                  X
                </button>
              </li>
            ))}
          </ul>
          {items.length < 1 ? (
            ""
          ) : (
            <div className="w-full flex justify-between p-3">
              <span>Total</span>
              <span>${total}</span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
