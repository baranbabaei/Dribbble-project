import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styles from './styles'
import Cart from '../../components/Cart/index.jsx'
import Product from '../../components/Product/index.jsx'
import getProducts from '../../services/getProducts'
import { Waypoint } from 'react-waypoint'

const Ordering = () => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchedText, setSearchedText] = useState('')
  const [cart, setCart] = useState({ items: [], totalPrice: 0 })
  const [currentPage, setCurrentPage] = useState(1)
  const [isDataFinished, setIsDataFinished] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const classes = styles()

  useEffect(() => {
    if (products.length === 0) {
      getProducts(currentPage).then(res => {
        setProducts(res.reverse())

        if (Array.isArray(res)) {
          if (res.length === 10) {
            setCurrentPage(currentPage + 1)
          } else {
            setIsDataFinished(true)
          }
        }
      })
    }
  }, [])

  useEffect(() => {
    if (searchedText) {
      setFilteredProducts(
        products.filter(product => product.name.includes(searchedText))
      )
    } else {
      setFilteredProducts(products)
    }
  }, [searchedText, products])

  const searchHandler = (e) => {
    setSearchedText(e.target.value)
  }

  const onReachEnd = () => {
    if (currentPage > 1 && filteredProducts.length > 0) {
      getProducts(currentPage).then(res => {
        if (Array.isArray(res)) {
          if (res.length === 10) {
            setCurrentPage(currentPage + 1)
          } else {
            setIsDataFinished(true)
          }

          setFilteredProducts((prevState) => ([...prevState, ...res]))
        }
      })
    }
  }

  const handleCart = (productId, action) => {
    const cartItem = cart.items.find(item => item.id === productId)

    if (action === 'add') {
      if (!cartItem) {
        const newCartItem = products.find(product => product.id === productId)
        newCartItem.quantity = 1
        cart.totalPrice += newCartItem.price

        setCart({ ...cart, items: [...cart.items, newCartItem] })
      } else {
        cartItem.quantity += 1
        cart.totalPrice += cartItem.price

        setCart({ ...cart })
      }
    } else if (action === 'remove') {
      if (cartItem) {
        if (cartItem.quantity > 1) {
          cart.totalPrice -= cartItem.price
          cartItem.quantity -= 1
          setCart({ ...cart })
        } else {
          cart.totalPrice -= cartItem.price
          const cartItems = cart.items.filter(item => item.id !== productId)
          setCart({ ...cart, items: cartItems })
        }
      }
    } else if (action === 'removeAll') {
      setCart({ items: [], totalPrice: 0 })
    }
  }

  return (
    <div className={classes.productsRoot}>
      <div className={classes.pageHeader}>
        <img src="./asset/images/back.png" alt="بازگشت" title='بازگشت' onClick={() => navigate(-1)} />
        <h3 className={classes.pageTitle}>ثبت فروش</h3>
      </div>
      <input
        type="text"
        onChange={searchHandler}
        className={classes.search}
        placeholder='نام طرح وارد کنید ...'
      />
      {products.length === 0
        ? <span className={classes.noItem}>در حال دریافت اطلاعات ...</span>
        : (filteredProducts.length === 0
          ? <span className={classes.noItem}>موردی یافت نشد!</span>
          : <div className={classes.products}>
            {
            filteredProducts.map(product => (
                product.stock_number !== 0 && <Product product={product} handleCart={handleCart} key={product.id} cart={cart} />
              ))
            }
            </div>
        )
      }
      {!isDataFinished &&
        <Waypoint onEnter={onReachEnd} bottomOffset={'-60%'}/>
      }
      {!!cart.items.length && <Cart items={cart.items} totalPrice={cart.totalPrice} handleCart={handleCart} customerId={location.state.id} />}
    </div>
  )
}

export default Ordering
