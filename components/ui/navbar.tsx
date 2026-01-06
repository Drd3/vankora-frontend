"use client";

import { ConnectButtonCustom } from './connect-button-custom';

const Navbar = () => {
    return(
        <nav className='w-full p-4 flex justify-end'>
            <div className='ml-auto'>
                <ConnectButtonCustom/>
            </div>
        </nav>
    )
}

export default Navbar