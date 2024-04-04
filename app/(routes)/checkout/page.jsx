"use client"
import { CartUpdateContext } from '@/app/_context/CartUpdateContext';
import GlobalApi from '@/app/_utils/GlobalApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser } from '@clerk/nextjs';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { Loader } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useContext, useEffect, useState } from 'react'
import { toast } from 'sonner';

function Checkout() {
  const params=useSearchParams();
  const {user}=useUser();
  const [cart,setCart]=useState([]);
  const {updateCart,setUpdateCart}=useContext(CartUpdateContext);
  const [deliveryAmount,setDeliveryAmount]=useState(300);
  const [taxAmount,setTaxAmount]=useState(0);
  const [total,setTotal]=useState(0.01);
  const [subTotal,setSubTotal]=useState(0);
  const [username,setUsername]=useState();
  const [email,setEmail]=useState();
  const [phone,setPhone]=useState();
  const [zip,setZip]=useState();
  const [address,setAddress]=useState();
  const [loading,setLoading]=useState(false);
  const router=useRouter();
  useEffect(()=>{
    console.log(params.get('restaurant'))
    user&&GetUserCart();
  },[user||updateCart])

  const GetUserCart=()=>{
    GlobalApi.GetUserCart(user?.primaryEmailAddress.emailAddress).then(resp=>{
      console.log(resp)
      setCart(resp?.userCarts);
      calculateTotalAmount(resp?.userCarts);
    })

   
  }

  const calculateTotalAmount=(cart_)=>{
    let total=0;
    cart_.forEach((item)=>{
      total=total+item.price;
    })
    setSubTotal(total.toFixed(2));
    setTaxAmount(total*0.12);
    setTotal(total+total*0.12+deliveryAmount);
  }

const addToOrder=()=>{
  setLoading(true)
  const data={
    email:user.primaryEmailAddress.emailAddress,
    orderAmount:total,
    restaurantName:params.get('restaurant'),
    userName:user.fullName,
    phone:phone,
    address:address,
    zipCode:zip,
  }
  GlobalApi.CreateNewOrder(data).then(resp=>{
    const resultId=resp?.createOrder?.id;
    if(resultId)
    {
        cart.forEach((item)=>{
          GlobalApi.UpdateOrderToAddOrderItems(item.productName,
            item.price,resultId,user?.primaryEmailAddress.emailAddress)
          .then(result=>{
            console.log(result);
            setLoading(false);
            toast('Заказ успешно создан!');
            setUpdateCart(!updateCart)
            SendEmail();
            router.replace('/confirmation');
          },(error)=>{
            setLoading(false)
          })
        })
    }
  },(error)=>{
    setLoading(false)
  })
}

const SendEmail=async()=>{
  try{
    const response=await fetch('/api/send-email',{
      method:'POST',
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify({email:user?.primaryEmailAddress.emailAddress})
    })

    if(!response.ok)
    {
      toast('Ошибка при отправки квитанции на почту')
    }
    else{
    toast('Квитанция была отправлена в почту')

    }
  }catch(err)
  {
    toast('Ошибка при отправки квитанции на почту')
  }
}

  return (
    <div>
      <h2 className='font-bold text-2xl my-5'>Оформление заказа</h2>
      <div className='p-5 px-5 md:px-10 grid grid-cols-1 md:grid-cols-3 py-8'>
        <div className='md:col-span-2 mx-20'>
            <h2 className='font-bold text-3xl'>Подтверждение заказа</h2>
            <div className='grid grid-cols-2 gap-10 mt-3'>
                <Input placeholder='Имя' onChange={(e)=>setUsername(e.target.value)} />
                <Input placeholder='Email почта' onChange={(e)=>setEmail(e.target.value)} />
            </div>
            <div className='grid grid-cols-2 gap-10 mt-3'>
                <Input placeholder='Номер телефона' onChange={(e)=>setPhone(e.target.value)} />
                <Input placeholder='Индекс' onChange={(e)=>setZip(e.target.value)}/>
            </div>
            <div className=' mt-3'>
                <Input placeholder='Адрес' onChange={(e)=>setAddress(e.target.value)} />

            </div>
        </div>
 <div className='mx-10 border'>
            <h2 className='p-3 bg-gray-200 font-bold text-center'>Подтверждение заказа ({cart?.length}) </h2>
            <div className='p-4 flex flex-col gap-4'>
                <h2 className='font-bold flex justify-between'>Подитог : <span>{subTotal} тенге</span></h2>
                <hr></hr>
                <h2 className='flex justify-between'>Доставка : <span>{deliveryAmount} тенге</span></h2>
                <h2 className='flex justify-between'>Налог (12%) : <span>{taxAmount.toFixed(2)} тенге</span></h2>
                <hr></hr>
                <h2 className='font-bold flex justify-between'>Итого : <span>{total.toFixed(2)} тенге</span></h2>
                {/* <Button onClick={()=>onApprove({paymentId:123})}>Payment <ArrowBigRight/> </Button> */}
               {/* <Button onClick={()=>SendEmail()}>
                {loading?<Loader className='animate-spin'/>:'Make Payment'} 

                </Button> */}
              {total>5&&  <PayPalButtons 
                disabled={!(username&&email&&address&&zip)||loading}
                style={{ layout: "horizontal" }} 
                onApprove={addToOrder}
                createOrder={(data,actions)=>{
                  return actions.order.create({
                    purchase_units:[
                      {
                        amount:{
                          value:total.toFixed(2),
                          currency_code:'USD'
                        }
                      }
                    ]
                  })
                }}
                />}

            </div>
        </div>
    </div>
    </div>
  )
}

export default Checkout