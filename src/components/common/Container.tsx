import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const Container = ({ children, className = "" }: ContainerProps) => {
  return (
    /* max-w-[1440px]: Giới hạn độ rộng tối đa để nội dung không bị loãng trên màn hình lớn.
       px-8 md:px-16 lg:px-24: Tạo khoảng thụt lề 2 bên tăng dần theo màn hình.
    */
    <div className={`max-w-[1440px] mx-auto px-8 md:px-16 lg:px-24 ${className}`}>
      {children}
    </div>
  );
};