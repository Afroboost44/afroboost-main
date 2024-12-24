import { useToasts } from 'react-toast-notifications'

const withToast = (Component) => {
  return function WrappedComponent(props) {
    const toastFuncs = useToasts()
    return <Component {...props} {...toastFuncs} />;
  }
}

export default withToast;