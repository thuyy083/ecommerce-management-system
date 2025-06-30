import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import { useForm, Controller } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Routes } from '~/config'


function ItemTypeForm({ submit, data }) {
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm()

  const onSubmit = async (data) => {
    console.log('data:', data)

    await submit({
      itemTypeName: data.typeName,
      itemTypeNameEn: data.typeNameEN,
    })
  }
  return (
    <Box
      sx={{
        minHeight: '400px',
      }}
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid size={12}>
            <Grid container spacing={2}>
              <Grid size={6}>
                <Controller
                  name="typeName"
                  control={control}
                  defaultValue={data?.ITEM_TYPE_NAME}
                  rules={{ required: 'Vui lòng nhập tên loại mặt hàng', }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Tên"
                      name='typeName'
                      fullWidth
                      error={!!errors.typeName}
                      helperText={errors.typeName?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={6}>
                <Controller
                  name="typeNameEN"
                  control={control}
                  defaultValue={data?.ITEM_TYPE_NAME_EN}
                  rules={{ required: 'Vui lòng nhập tên tiếng Anh của loại mặt hàng' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Tên tiếng anh"
                      name='typeNameEN'
                      type="text"
                      fullWidth
                      error={!!errors.typeNameEN}
                      helperText={errors.typeNameEN?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
          <Button variant="outlined" color="secondary" type="reset"
            LinkComponent={Link} to={Routes.admin.itemType.list}
          >
            Hủy
          </Button>
          <Button variant="contained" color="primary" type="submit">
            Lưu
          </Button>
        </Box>
      </form>
    </Box>
  )
}

export default ItemTypeForm