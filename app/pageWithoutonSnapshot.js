'use client'
import { useState, useEffect } from 'react'
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from './firebase'

export default function Home() {
  const [items, setItems] = useState([
    // { name: 'Coffee', price: 4.95 },
    // { name: 'Candee', price: 7.95 },
    // { name: 'Movie', price: 24.95 }
  ])

  const [newItem, setNewItem] = useState({ name: '', price: '' })

  const [total, setTotal] = useState(0)

  // ADD ITEM TO DB

  const handleChange = (e) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value })
    console.log(newItem)
  }

  const addItem = async (e) => {
    e.preventDefault()

    // no blank input
    if (newItem !== '' && newItem.price !== '') {
      //This is pushing it to the sate items
      // setItems([...items, newItem])

      const docRef = await addDoc(collection(db, 'items'), {
        name: newItem.name.trim(),
        price: newItem.price
      })
      //adding this setItems so that i don't have to use a dependency in the useEffect
      setItems((oldItems) => [...oldItems, { ...newItem, id: docRef.id }])
      setNewItem({ name: '', price: '' })
    }
  }

  // READ ITEMS FROM DB

  useEffect(() => {
    const fetchItems = async () => {
      const querySnapshot = await getDocs(collection(db, 'items'))
      let itemsArray = []
      querySnapshot.forEach((doc) => {
        itemsArray.push({
          ...doc.data(),
          id: doc.id
          // name: doc.data().name,
          // price: doc.data().price
        })
        console.log(`name: ${doc.data().name}, price: ${doc.data().price}`)
      })
      setItems(itemsArray)
      console.log(itemsArray)

      // check totalprice
      const calculateTotal = () => {
        const totalPrice = itemsArray.reduce(
          (sum, item) => sum + parseFloat(item.price),
          0
        )
        setTotal(totalPrice)
      }
      calculateTotal()
    }
    fetchItems()
  }, [newItem])

  // DELETE ITEMS FROM DB
  const deleteItem = async (id) => {
    await deleteDoc(doc(db, 'items', id))
    // this doesn't check if the total is reduced...
    // setItems(items.filter((item) => item.id !== id)) // Update the local state

    // updating the items and checking the new total amount

    const updatedItems = items.filter((item) => item.id !== id)
    setItems(updatedItems)

    const updatedTotal = updatedItems.reduce(
      (sum, item) => sum + parseFloat(item.price),
      0
    )
    setTotal(updatedTotal)
  }

  return (
    <main className='flex min-h-screen flex-col items-center justify-between sm:p-24 p-4'>
      <div className='z-10 w-full max-w-5xl items-center justify-between font-mono text-sm'>
        <h1 className='text-4xl p-4 text-center'>Expense Tracker</h1>
        <div className='bg-slate-800 p-4 rounded-lg'>
          <form className='grid grid-cols-6 items-center text-black'>
            <input
              value={newItem.name}
              name='name'
              className='col-span-3 p-3 border'
              type='text'
              placeholder='Enter Item'
              onChange={handleChange}
            />
            <input
              value={newItem.price}
              name='price'
              className='col-span-2  p-3 border mx-3'
              type='number'
              placeholder='Enter $'
              onChange={handleChange}
            />
            <button
              className='text-white hover:bg-slate-900 p-3 text-xl'
              type='submit'
              onClick={addItem}
            >
              +
            </button>
          </form>
          <ul className='max-h-[350px] overflow-y-scroll'>
            {items.map((item, id) => (
              <li
                key={id}
                className='my-4 w-full flex justify-between bg-slate-950 '
              >
                <div className='p-4 w-full flex justify-between'>
                  <span className='capitalize '>{item.name}</span>
                  <span>${item.price}</span>
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  className='ml-8 border-l-2 border-slate-900 hover:bg-slate-900 w-16'
                >
                  X
                </button>
              </li>
            ))}
          </ul>
          {items.length < 1 ? (
            ''
          ) : (
            <div className='w-full flex justify-between p-3'>
              <span>Total</span>
              <span>${total}</span>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
