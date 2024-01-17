import { describe, expect, it } from 'vitest'

// import { mount } from '@vue/test-utils'
import HelloWorld from '../HelloWorld.vue'
import { render, screen } from '@testing-library/vue'

describe('HelloWorld', () => {

  it('renders properly', () => {
  
    // const wrapper = mount(HelloWorld, { props: { msg: 'Hello Vitest' } })
    // expect(wrapper.text()).toContain('Hello Vitest')
     
    render(HelloWorld,{ props: { msg: 'Hello Vitest' } });
    // render is similar to mount function

    const element = screen.getByText('Hello Vitest');
    // returns an html element 

    expect(element).toBeTruthy();
  
  
  })
})

// describe, expect, test/it => test functions from vitest
// describe => for grouping the tests
// it/test => for test functions
// 'renders properly' => name of the test => will be printed in the console

// in the test
// 1st we setup the environment
// const wrapper = mount(HelloWorld, { props: { msg: 'Hello Vitest' } })

// 2nd interact with it

// 3rd do the assertions and check the results are correct or not
// expect(wrapper.text()).toContain('Hello Vitest')

// testing library provides functions like mount for testing