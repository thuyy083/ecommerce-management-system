import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

function useUserInfo() {
  const user = useSelector(state => state.user.currentUser)
  const [userId, setUserId] = useState(null)
  const [nameInfo, setNameInfo] = useState(null)
  const [gender, setGender] = useState(null)
  const [email, setEmail] = useState(null)
  const [birthDate, setBirthDate] = useState(null)
  const [avatarImgUrl, setAvatarImgUrl] = useState(null)
  const [addressInfo, setAddressInfo] = useState(null)
  const [phoneNumberInfo, setPhoneNumberInfo] = useState(null)
  const [accountDeviceInfo, setAccountDeviceInfo] = useState(null)

  useEffect(() => {
    if (!user) {
      setUserId(null)
      setGender(null)
      setBirthDate(null)
      setAvatarImgUrl(null)
      setEmail(null)
      setAddressInfo(null)
      setPhoneNumberInfo(null)
      setAccountDeviceInfo(null)
    } else {
      const {
        NAME,
        CURRENT_GENDER,
        BIRTH_DATE,
        AVATAR_IMG_URL,
        EMAIL,
        ADDRESS,
        PHONE_NUMBER,
        ACCOUNT_DEVICE,
        USER_ID
      } = user
      setNameInfo({
        lastName: NAME?.LAST_NAME,
        firstName: NAME?.FIRST_NAME,
        middleName: NAME?.MIDDLE_NAME,
        fullName: NAME?.FULL_NAME
      })
      setGender(CURRENT_GENDER)
      setBirthDate(BIRTH_DATE)
      setAvatarImgUrl(AVATAR_IMG_URL)
      setEmail(EMAIL)
      setAddressInfo(ADDRESS)
      setPhoneNumberInfo(PHONE_NUMBER)
      setAccountDeviceInfo(ACCOUNT_DEVICE)
      setUserId(USER_ID)
    }
  }, [user])

  return {
    nameInfo,
    gender,
    email,
    birthDate,
    avatarImgUrl,
    addressInfo,
    phoneNumberInfo,
    accountDeviceInfo,
    userId
  }
}

export default useUserInfo