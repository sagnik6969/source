import { describe, expect, it } from 'vitest'
import ProfileImage from '../ProfileImage.vue'
import { render, screen } from '@testing-library/vue'
describe('profile image', () => {
  describe('when temp image is undefined', () => {
    describe('when user image is undefined', () => {
      it('displays default profile image', () => {
        render(ProfileImage)
        expect(screen.getByAltText('image')).toHaveAttribute('src', '/src/assets/profile.png')
      })
    })

    describe('when user image is set', () => {
      it('displays user image', () => {
        render(ProfileImage, { props: { image: 'user-image.png' } })
        expect(screen.getByAltText('image')).toHaveAttribute('src', 'user-image.png')
      })

      describe('when temp image is set', () => {
        it('displays temp image', async () => {
          const { rerender } = render(ProfileImage, { props: { image: 'user-image.png' } })
          await rerender({ image: 'user-image.png', tempImage: 'base64-encoded-file' })
          //rerender function is used to rerender a component with different props
          expect(screen.getByAltText('image')).toHaveAttribute('src', 'base64-encoded-file')
        })
      })
    })
  })

  describe('when temp image is set', () => {
    it('displays temp image', () => {
      render(ProfileImage, { props: { tempImage: 'base64-encoded-file' } })
      expect(screen.getByAltText('image')).toHaveAttribute('src', 'base64-encoded-file')
    })
  })
})
