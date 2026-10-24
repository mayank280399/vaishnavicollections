import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

interface BreadCrumbProps {
  subcategory:string;
  parent?: {
    name: string;
    slug: string;
  };
}
export default function BreadCrumb({ subcategory, parent }: BreadCrumbProps) {
  return (
   <nav
           aria-label="Breadcrumb"
           className="border-b border-[#10233e]/10 px-4 py-3 sm:px-6 lg:px-8"
         >
           <div className="mx-auto flex max-w-7xl items-center gap-1.5 overflow-x-auto whitespace-nowrap text-xs text-[#10233e]/55">
             <Link href="/"className="inline-flex items-center gap-1 hover:text-[#b18425]">
               <Home size={13} />  Home
             </Link>
   
             <ChevronRight size={13} />
   
             {parent && (
               <Link href={`/collections/${parent.slug}`}className="hover:text-[#b18425]">
                 {parent.name}
               </Link>
             )}
   
             <ChevronRight size={13} />
   
             <span className="font-medium text-[#10233e]">
               {subcategory}
             </span>
           </div>
         </nav>
  )
}
