import { ConnectButton } from '@rainbow-me/rainbowkit';

export const ConnectButtonCustom = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button onClick={openConnectModal} type="button">
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal} type="button">
                    Wrong network
                  </button>
                );
              }

              return (
                <div className='bg-gray-100 rounded-md border' style={{ display: 'flex' }}>
                    <button onClick={openAccountModal} type="button" className='py-2 pr-4 cursor-pointer flex items-center gap-4'>
                        <div className='p-2 bg-[#C8BFEF] w-8 h-8 rounded-full ml-2'>
                            <img 
                                src={"https://api.dicebear.com/9.x/identicon/svg?seed=" + account.address} 
                                alt=""
                                className="relative object-cover w-full h-full"
                            />
                        </div>
                        {account.displayName}
                        {/* {account.displayBalance
                        ? ` (${account.displayBalance})`
                        : ''} */}
                    </button>
                    <button
                        onClick={openChainModal}
                        style={{ display: 'flex', alignItems: 'center' }}
                        type="button"
                        className='p-2 bg-gray-300 rounded-r-md cursor-pointer'
                    >
                    {chain.hasIcon && (
                        <div
                            style={{
                            background: chain.iconBackground,
                            width: 20,
                            height: 20,
                            borderRadius: 999,
                            overflow: 'hidden',
                            marginRight: 4,
                            }}
                        >
                            {chain.iconUrl && (
                            <img
                                alt={chain.name ?? 'Chain icon'}
                                src={chain.iconUrl}
                                style={{ width: 20, height: 20 }}
                            />
                            )}
                        </div>
                        )}
                    </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};