import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

function Confirmation() {
  return (
    <div className='flex justify-center my-20'>
    <div className='border shadow-md flex flex-col justify-center
    p-20 rounded-md items-center gap-3 px-32'>
        <CheckCircle2 className='h-24 w-24 text-primary' />
        <h2 className='font-medium text-3xl text-primary'>Заказ успешно</h2>
        <h2>Благодарим вас что заказали у нас</h2>
       <Link href={'/my-order'}> <Button className="mt-8">
          Отслеживать заказ</Button>
          </Link>
    </div>
    </div>
  )
}

export default Confirmation