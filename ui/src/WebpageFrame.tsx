import React from 'react'

interface WebpageFrameProps {
  src: string;
}

const WebpageFrame: React.FC<WebpageFrameProps> = ({ src }) => {
  return (
    <iframe
      src={src}
      style={{
        flexGrow: 1,
        width: '100%',
        border: '1px solid #ccc',
        boxSizing: 'border-box',
      }}
      title="Service Frame"
    />
  )
}

export default WebpageFrame;
