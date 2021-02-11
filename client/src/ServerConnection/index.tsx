import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import geckos, { ClientChannel, Data } from "@geckos.io/client";
import { EmitOptions } from "@geckos.io/common/lib/types";

interface StoreContextValues {
  id?: string;
  // setId: React.Dispatch<React.SetStateAction<string | undefined>>;
  connected: boolean;
  // setConnected: React.Dispatch<React.SetStateAction<boolean>>;
  lastMessage?: Data;
  // setLastMessage: React.Dispatch<React.SetStateAction<Data | undefined>>;
  lastError?: Error;
  setServerDetails: React.Dispatch<
    React.SetStateAction<ServerDetails | undefined>
  >;

  sendMessage: (
    eventName: string,
    message: Data,
    options?: EmitOptions | undefined
  ) => void;
}

const StoreContext = createContext({} as StoreContextValues);

export const useGameServer = () => useContext(StoreContext);

interface ServerProviderProps {
  children: JSX.Element;
}

interface ServerDetails {
  url: string;
  port: number;
  authorization: string;
}

export function ServerProvider({ children }: ServerProviderProps): JSX.Element {
  const [id, setId] = useState<string | undefined>();
  const [connected, setConnected] = useState<boolean>(false);
  const [lastMessage, setLastMessage] = useState<Data | undefined>();
  const [lastError, setLastError] = useState<Error | undefined>();

  const [serverDetails, setServerDetails] = useState<
    ServerDetails | undefined
  >();

  const ChannelRef = useRef<ClientChannel | undefined>();

  const sendMessage = useCallback(
    (eventName: string, message: Data, options?: EmitOptions) => {
      if (ChannelRef.current && connected) {
        ChannelRef.current.emit(eventName, message, options);
      }
    },
    [connected]
  );

  useEffect(() => {
    if (serverDetails) {
      ChannelRef.current = geckos({
        ...serverDetails,
      });

      ChannelRef.current.onConnect((error) => {
        if (error) {
          setLastError(error);
          return;
        }

        setConnected(true);
        setId(ChannelRef.current?.id);

        ChannelRef.current?.on("chat message", setLastMessage);

        ChannelRef.current?.onDisconnect((error) => {
          if (error) {
            setLastError(error);
            return;
          }

          setConnected(false);
        });
      });
    }

    return () => {
      ChannelRef.current?.close();
    };
  }, [serverDetails]);

  const store: StoreContextValues = {
    id,
    connected,
    lastMessage,
    lastError,
    setServerDetails,
    sendMessage,
  };

  return (
    <StoreContext.Provider value={store as StoreContextValues}>
      {children}
    </StoreContext.Provider>
  );
}
