import React, { useCallback, useEffect, useState } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'

import locationService from '~/service/external/location.service'
import { Chip, InputAdornment, Typography } from '@mui/material'
import { toast } from 'react-toastify'

const TABS = ['Tỉnh/Thành phố', 'Quận/Huyện', 'Phường']

function LocationSelector({ value, onChange, error, label = 'Địa chỉ:', disable }) {
  const [tab, setTab] = useState(0)
  const [open, setOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [location, setLocation] = useState({
    city: {
      name: value?.city
    },
    district: {
      name: value?.district
    },
    ward: {
      name: value?.ward
    },
  })

  const [locationOption, setLocationOption] = useState({
    city: [],
    district : [],
    ward: [],
  })

  const getPathLocation = useCallback(() => {
    if (location.ward?.name) {
      return location?.ward?.path_with_type
    } else if (location.district?.name) {
      return location?.district?.path_with_type
    } else if (location.city?.name) {
      return location?.city?.name_with_type
    } else {
      return ''
    }
  }, [location])

  useEffect(() => {
    if (value?.city && value?.district && value?.ward) {
      let initialLocation = {}
      locationService.getProvincesByName(value.city)
        .then(async res => {
          try {
            const cities = await locationService.getAllProvinces()
            setLocation(prev => ({
              ...prev,
              city: res?.data?.data[0]
            }))
            initialLocation = {
              city: res?.data?.data[0]
            }
            setLocationOption(prev => ({
              ...prev,
              city: cities?.data?.data
            }))
            const cityCode = res?.data?.data[0].code
            const districtRes = await locationService.getDistrictByProvince(cityCode)
            const targetDistrict = districtRes?.data?.data?.find(district => district.name === value.district)
            setLocation(prev => ({
              ...prev,
              district: targetDistrict
            }))
            initialLocation = {
              ...initialLocation,
              district: targetDistrict
            }
            setLocationOption(prev => ({
              ...prev,
              district: districtRes?.data?.data
            }))

            const wardRes = await locationService.getWardByDistrict(targetDistrict?.code)
            const targetWard = wardRes?.data?.data?.find(ward => ward.name === value.ward)
            setLocation(prev => ({
              ...prev,
              ward: targetWard
            }))
            initialLocation = {
              ...initialLocation,
              ward: targetWard
            }
            setLocationOption(prev => ({
              ...prev,
              ward: wardRes?.data?.data
            }))
            onChange(initialLocation)
          } catch (error) {
            console.log(error)
            toast('Có lỗi xảy ra trong quá trình gọi API địa chỉ', {
              hideProgressBar: true,
              style: { backgroundColor: '#e74c3c', color: 'white' }
            })
          }
        })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!location.city?.name) {
      locationService.getAllProvinces()
        .then(data => {
          // console.log(data?.data)
          setLocationOption({
            ...locationOption,
            city: data?.data?.data
          })
          setTab(0)
        })
    } else if (location?.city?.name && !location.district?.name) {
      locationService.getDistrictByProvince(location?.city.code)
        .then(data => {
          // console.log(data?.data?.data)
          setLocationOption({
            ...locationOption,
            district: data?.data?.data
          })
          setTab(1)
        })
    } else if (location?.district?.name !== 0 && !location.ward?.name) {
      locationService.getWardByDistrict(location?.district.code)
        .then(data => {
          // console.log(data?.data?.data)
          setLocationOption({
            ...locationOption,
            ward: data?.data?.data
          })
          setTab(2)
        })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location])


  const handleChangTab = (event, newValue) => {
    if (newValue > 0 && !location?.city?.name) {
      toast('Vui lòng chọn Tỉnh/Thành phố', {
        hideProgressBar: true,
        style: { backgroundColor: '#3498db', color: 'white' }
      })
      return
    } else if (newValue > 1 && !location?.district?.name) {
      toast('Vui lòng chọn Quận/Huyện', {
        hideProgressBar: true,
        style: { backgroundColor: '#3498db', color: 'white' }
      })
      return
    }
    setSearchInput(location[Object.keys(location)[newValue]]?.name)
    setTab(newValue)
  }


  const handleSelectLocation = (option) => {
    if (option?.type === 'tinh' || option?.type === 'thanh-pho' && !option?.parent_code) {
      const newLocation = {
        city: option,
        district: {},
        ward: {}
      }
      setLocation(newLocation)
      onChange(newLocation)
    } else if (option?.parent_code === location?.city?.code) {
      const newLocation = {
        ...location,
        district: option,
        ward: {}
      }
      setLocation(newLocation)
      onChange(newLocation)
    } else {
      const newLocation = {
        ...location,
        ward: option
      }
      setOpen(false)
      setLocation(newLocation)
      onChange(newLocation)
    }
  }

  return (
    <Box >
      {!disable && (
        <>
          <Tabs
            value={tab}
            variant="fullWidth"
            indicatorColor='transparent'
            onChange={handleChangTab}
          >
            {TABS.map((tab) => (
              <Tab key={tab} label={tab} />
            ))}
          </Tabs>
          <Autocomplete
            freeSolo
            autoSelect
            disablePortal
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            disabled={disable}
            getOptionLabel={(option) => option.name || ''}
            options={locationOption[Object.keys(locationOption)[tab]] ?? []}
            inputValue={searchInput}
            onInputChange={(event, newValue) => {
              setSearchInput(newValue)
            }}
            renderInput={(params) => (
              <TextField
                id='search-location-input'
                {...params}
                label="Tỉnh/Thành phố, Quận/Huyện, Phường/Xã"
                error={!!error?.message}
                helperText={error?.message}
              />)}
            renderOption={(props, option) => {
              const key = props.key
              delete props.key
              return (
                <li key={key} {...props} onClick={() => handleSelectLocation(option)}>
                  {option?.name_with_type}
                </li>
              )
            }}
          />
        </>
      )}
      <Box mt={2}>
        <Typography variant='body1'>{label} </Typography>
        {!!getPathLocation() && <>
          <Chip
            label={getPathLocation()}
            variant="outlined"
            onDelete={disable ? null : () => {
              const initState = {
                city: {},
                district: {},
                ward: {},
              }
              setLocation(initState)
              setTab(0)
              onChange(initState)
            }}
            sx={{
              mt: 1,
            }}
          />
        </>}
      </Box>
    </Box>
  )

}

export default LocationSelector