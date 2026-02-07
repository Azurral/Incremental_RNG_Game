import type { NextPage } from 'next';
import Image from 'next/image';

const MainScreenGui: NextPage = () => {
  return (
    <div className="w-full h-[838px] relative overflow-hidden bg-[url('/water.gif')] bg-cover bg-center">
      <div className="absolute top-[680px] left-[1125px] w-[298px]">
        <Image src="/merged-asset-2@2x.png" alt="" width={298} height={95} className="object-cover w-full h-[95px]" />
      </div>

      <div className="absolute top-0 left-0 w-[1466px] h-[838px] pointer-events-none">
        <Image src="/merged-asset-1@2x.png" alt="" width={1466} height={838} className="object-cover w-full h-full absolute inset-0" />

        <div className="absolute top-[701px] left-0 w-[1466px] h-[137px] rounded-[10px] bg-gray" />
        <div className="absolute top-[701px] left-0 w-[1466px] h-[122px] rounded-[10px] bg-darkgray border-[4px] border-darkslategray-100" />
        <Image src="/Main-Frame.svg" alt="" width={1466} height={793} className="absolute top-[12px] left-0 w-[1466px] h-[793px]" />

        <div className="absolute top-[650px] left-[43px] w-[1377px] h-[51px] rounded-[10px] bg-gray" />
        <div className="absolute top-[650px] left-[43px] w-[1377px] h-[42px] rounded-[10px] bg-tan border-[4px] border-darkslategray-100" />

        <Image src="/Body-ScrollingFrame@2x.png" alt="" width={1380} height={540} className="absolute top-[144px] left-[43px] w-[1380px] h-[540px] object-cover" />

        <div className="absolute top-[61px] left-[819px] w-[552px] h-[83px] rounded-t-[10px] bg-springgreen border-t-[4px] border-r-[4px] border-l-[4px] border-darkslategray-100">
          <div className="absolute top-[10px] left-[10px] w-[531px] h-[63px] bg-gray border-[4px] border-gray rounded-[5px]"><input placeholder="SEARCH" className="w-full h-full bg-transparent outline-none border-none text-[32px] font-press-start-2p text-gray pl-[12px]" /></div>
        </div>

        <Image src="/Exit-ImageButton.svg" alt="" width={80} height={99} className="absolute top-0 left-[1386px] w-20 h-[99px]" />

        <header className="absolute top-0 left-0 w-[420px] h-32">
          <div className="absolute top-0 left-0 w-[420px] h-[125px] rounded-[10px] bg-gray" />
          <div className="absolute top-0 left-0 w-[420px] h-[117px] rounded-[10px] bg-forestgreen border-[4px] border-darkslategray-100" />
          <div className="absolute top-0 left-0 w-[420px] h-[107px] rounded-[10px] bg-springgreen border-[4px] border-darkslategray-200">
            <div className="absolute top-[10px] left-[10px] w-[400px] h-[87px] bg-gray border-[4px] border-gray rounded-[5px]" />
            <h1 className="absolute top-[23px] left-[35px] m-0 text-[70px] font-press-start-2p text-white">INDEX</h1>
          </div>
        </header>
      </div>
    </div>
  );
};

export default MainScreenGui;
